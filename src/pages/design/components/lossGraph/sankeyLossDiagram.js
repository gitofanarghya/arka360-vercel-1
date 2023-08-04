let losses_data,
    p5_sankey;

const sankey_chart_details = {
    // default canvas size
    canvas: {
        width: 400,
        height: 400,
    },
    get arrow_width_max() {
        return this.canvas.width * 0.25;
    },
    get no_of_loss_components() {
        return losses_data.length;
    },
    get min_height_per_loss() {
        return this.canvas.height / 20;
    },
    get width_per_loss_arrow() {
        return this.canvas.width / 25;
    },
    diagramStrokeWeight: 2,
    shrink_scale: 1,
    parseData() {
        const component_names = [];
        const loss_names = [];
        const units = [];
        const loss_percentages = [];
        const arrow_width = [];
        const absolute_values = [];
        for (let i = 0; i < this.no_of_loss_components; ++i) {
            component_names.push(Object.keys(losses_data[i])[0]);
            loss_names.push([]);
            loss_percentages.push([]);
            absolute_values.push([]);
            arrow_width.push([]);
            for (let j = 0; j < losses_data[i][component_names[i]].length; ++j) {
                const l = losses_data[i][component_names[i]][j];
                if (j === 0) {
                    if (l.initial_name === undefined && l.initial_value === undefined && l.units === undefined) {
                        loss_names[i].push('', l.loss);
                        loss_percentages[i].push(l.percent);
                        absolute_values[i].push(absolute_values[i - 1][absolute_values[i - 1].length - 1]);
                        absolute_values[i].push(absolute_values[i][0] * (1 + (l.percent) / 100));
                    }
                    else {
                        loss_names[i].push(l.initial_name || '');
                        absolute_values[i].push(l.initial_value || absolute_values[i - 1][absolute_values[i - 1].length - 1]);
                    }
                    units.push(l.units || units[i - 1]);
                    if (i === 0) {
                        arrow_width[i].push(this.arrow_width_max);
                    }
                    else if (l.loss) {
                        arrow_width[i].push(arrow_width[i - 1][arrow_width[i - 1].length - 1]);
                        arrow_width[i].push(arrow_width[i][0] * (100 + l.percent) / 100);
                    }
                    else {
                        arrow_width[i].push(arrow_width[i - 1][arrow_width[i - 1].length - 1]);
                    }
                }
                else {
                    loss_names[i].push(l.loss);
                    loss_percentages[i].push(l.percent);
                    absolute_values[i].push(absolute_values[i][absolute_values[i].length - 1] * (1 + (l.percent) / 100));
                    arrow_width[i].push(arrow_width[i][arrow_width[i].length - 1] * (absolute_values[i][absolute_values[i].length - 1] / absolute_values[i][absolute_values[i].length - 2]));
                }
            }
        }
        this.parsed_data = {
            component_names,
            loss_names,
            units,
            loss_percentages,
            arrow_width,
            absolute_values,
        };
    },
    parse_again: false,
    get data() {
        if (this.parsed_data === undefined || this.parse_again) {
            this.parseData();
            this.parse_again = false;
            return this.parsed_data;
        } return this.parsed_data;
    },
};

const sankey_p5_closure = function (sketch) {
    sketch.setup = function () {
        this.createCanvas(sankey_chart_details.canvas.width, sankey_chart_details.canvas.height);
    };
    sketch.draw = function () {
        sketch.scale(sankey_chart_details.shrink_scale);
        sketch.background(255);
        sketch.rectMode(sketch.CENTER);
        sketch.smooth();
        let start = {
            x: sankey_chart_details.canvas.width / 3 + sankey_chart_details.arrow_width_max / 2,
            y: sankey_chart_details.min_height_per_loss / 2 + 50,
        };
        const dis_bw_components = sankey_chart_details.canvas.height / 20;
        for (let i = 0; i < sankey_chart_details.no_of_loss_components; ++i) {
            printComponentNames(sketch, start.x, start.y - dis_bw_components, i);
            start = strokeComponent(sketch, i, start);
            start.y += dis_bw_components;
        }
        if (start.y >= sankey_chart_details.canvas.height) {
            sankey_chart_details.shrink_scale = sankey_chart_details.canvas.height / start.y;
        }
    };
};

function strokeComponent(s, component_no, start) {
    s.stroke(40);
    s.strokeWeight(sankey_chart_details.diagramStrokeWeight);
    s.noFill();
    s.translate(start.x, start.y);
    const widths = sankey_chart_details.data.arrow_width[component_no];
    const height = sankey_chart_details.min_height_per_loss;
    const loss_arrow_width = sankey_chart_details.width_per_loss_arrow;
    const loss_percentages = sankey_chart_details.data.loss_percentages[component_no];
    let offsetY = 0;
    let offsetX = 0;

    printAbsoluteValues(s, 0, 0, true, component_no);

    for (let i = 0; i < widths.length; ++i) {
        let loss_arrow_height = s.abs(widths[i] * loss_percentages[i] / 100) || 0.5;
        if (i === widths.length - 1) {
            loss_arrow_height = 0;
        }
        if (i === 0) {
            s.line(offsetX - widths[i] / 2, offsetY - height / 2, offsetX + widths[i] / 2, offsetY - height / 2);
        }
        s.line(offsetX - widths[i] / 2, offsetY - height / 2, offsetX - widths[i] / 2, offsetY + height / 2);
        s.line(offsetX + widths[i] / 2, offsetY - height / 2, offsetX + widths[i] / 2, offsetY + height / 2);
        if (i === widths.length - 1 && component_no < sankey_chart_details.no_of_loss_components - 1) {
            s.line(offsetX - widths[i] / 2, offsetY + height / 2, offsetX + widths[i] / 2, offsetY + height / 2);
        }
        if (i < widths.length - 1) {
            s.arc(offsetX + (widths[i] / 2), offsetY + height / 2, s.abs(widths[i] - widths[i + 1]) * 2, loss_arrow_height * 2, s.HALF_PI, s.PI);
            s.line(offsetX + widths[i] / 2, offsetY + height / 2, offsetX + widths[i] / 2 + loss_arrow_width, offsetY + height / 2);
            s.line(offsetX + widths[i] / 2, offsetY + height / 2 + loss_arrow_height, offsetX + widths[i] / 2 + loss_arrow_width, offsetY + height / 2 + loss_arrow_height);
            s.triangle(offsetX + widths[i] / 2 + loss_arrow_width, offsetY + height / 2 - loss_arrow_height * 0.3, offsetX + widths[i] / 2 + loss_arrow_width, offsetY + height / 2 + loss_arrow_height * 1.3, offsetX + widths[i] / 2 + loss_arrow_width + loss_arrow_height, offsetY + height / 2 + loss_arrow_height / 2);
            printPerLossDetails(s, offsetX + widths[i] / 2 + loss_arrow_width + loss_arrow_height, offsetY + height / 2 + loss_arrow_height / 2, component_no, i, offsetX - widths[i] / 2);
            offsetX -= (widths[i] - widths[i + 1]) / 2;
            s.line(offsetX - widths[i + 1] / 2, offsetY + height / 2, offsetX - widths[i + 1] / 2, offsetY + height / 2 + loss_arrow_height);
            s.line(offsetX + widths[i + 1] / 2, offsetY + height / 2, offsetX + widths[i + 1] / 2, offsetY + height / 2 + loss_arrow_height);
        }
        offsetY += height + loss_arrow_height;
    }
    s.translate(-start.x, -start.y);
    const end = {
        x: offsetX + start.x,
        y: offsetY + start.y,
    };

    printAbsoluteValues(s, end.x, end.y - height, false, component_no);

    if (component_no === sankey_chart_details.no_of_loss_components - 1) {
        s.line(end.x + widths[widths.length - 1] / 2, end.y - height / 2, end.x, end.y + height * 2.5);
        s.line(end.x - widths[widths.length - 1] / 2, end.y - height / 2, end.x, end.y + height * 2.5);
        end.y += height * 2.5;
    }
    return end;
}

function printPerLossDetails(s, x, y, component_no, loss_no, shiftX) {
    const size = 24 * sankey_chart_details.canvas.height / 1000;
    const percentage = sankey_chart_details.data.loss_percentages[component_no][loss_no];
    const loss_name = sankey_chart_details.data.loss_names[component_no][loss_no + 1];
    let offsetX = 20;
    const offsetY = 5;
    s.strokeWeight(0);
    s.fill(40);
    s.textSize(size);
    s.textStyle(s.NORMAL);
    s.text(`${percentage} %`, x + offsetX, y + offsetY);
    x = sankey_chart_details.arrow_width_max + sankey_chart_details.width_per_loss_arrow + shiftX;
    offsetX += sankey_chart_details.canvas.width / 10;
    s.text(loss_name, x + offsetX, y + offsetY);
    s.strokeWeight(sankey_chart_details.diagramStrokeWeight);
    s.noFill();
}

function printComponentNames(s, x, y, component_no) {
    const name = sankey_chart_details.data.component_names[component_no];
    const size = 32 * sankey_chart_details.canvas.height / 1000;
    s.strokeWeight(0);
    s.fill(40);
    s.textSize(size);
    s.textStyle(s.BOLD);
    s.text(name, x - s.textWidth(name) / 2, y + size / 4);
    s.noFill();
}

function printAbsoluteValues(s, x, y, start_of_component, component_no) {
    const size = 24 * sankey_chart_details.canvas.height / 1000;
    s.strokeWeight(0);
    s.fill(40);
    s.textSize(size);
    s.textStyle(s.NORMAL);
    if (start_of_component) {
        const value = sankey_chart_details.data.absolute_values[component_no][0];
    }
    else {
        const value = sankey_chart_details.data.absolute_values[component_no][sankey_chart_details.data.absolute_values[component_no].length - 1];
    }
    const unit = sankey_chart_details.data.units[component_no];
    value = s.round(value);
    s.text(`${value} ${unit}`, x - s.textWidth(`${value} ${unit}`) / 2, y + size / 4);
    s.strokeWeight(sankey_chart_details.diagramStrokeWeight);
    s.noFill();
}

function render(data, canvasSize) {
    // comeback
    sankey_chart_details.canvas.width = canvasSize.width;
    sankey_chart_details.canvas.height = canvasSize.width;
    losses_data = data;
    p5_sankey = new p5(sankey_p5_closure, 'sankey_loss_diagram');
}

function resizeCanvas(canvasSize) {
    p5_sankey.remove();
    sankey_chart_details.parse_again = true;
    render(losses_data, canvasSize);
}

export { render as renderSankeyDiagram, resizeCanvas as resizeSankeyDiagram };
