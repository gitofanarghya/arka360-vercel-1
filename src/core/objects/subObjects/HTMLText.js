import * as utils from "../../../components/ui/length/utils"; 
import {ENABLE_TEXT_SELECTION, DISABLE_TEXT_SELECTION} from "../../coreConstants";
import ArcMeasurement from "./ArcMeasurement";
import RotationPoint from "./RotationPoint";

export default class HTMLText {

    constructor(text, position, angle, stage, direction, distance, parent, inputValidator) {

        // standard norms
        this.stage = stage;

        this.text = text;
        this.angle = angle;
        this.position = position;
        this.direction = direction;
        this.distance = distance;

        // properties
        this.parent = parent;
        this.inputValidator = inputValidator;
        this.isSelectionEnabled = false;

        // create div element and set properties
        let div = document.createElement('div');
        div.className = 'single-line mousetrap';
        this.element = div;

        // dom element to add HTML text
        this.domElement = this.stage.rendererManager.getDomElement().parentElement;
        this.domElement.appendChild(this.element);

        // text box alignment and positioning
        this.update(text, position, angle, direction, distance);

        // option to check whether container should be created
        this._shouldCreateContainer = true;
        this._shouldCompleteOnNoChange = false;

        this.elementWidth = this.element.offsetWidth;
        this.elementHeight = this.element.offsetHeight;
    }

    getElementInnerText() {
        return this.element.innerHTML
            .replace(/<div>/g, '')
            .replace(/<\/div>/g,'')
            .replace(/<br>/g, '');
    }

    setElementInnerText(text) {
        this.element.innerHTML = text;
    }

    _setPosition(position, direction, distance) {

        let pi = Math.PI;
        let divWidth = this.elementWidth;
        let divHeight = this.elementHeight;
        let angle = Math.atan2(direction.y, direction.x);
        let camera = this.stage.cameraManager.get2dCamera();

        // get screen pixel coordinates of position
        let coords2d = position.clone().project(camera);
        coords2d.x = (coords2d.x + 1) / 2 * this.stage.screenDimensions.width;
        coords2d.y = -(coords2d.y - 1) / 2 * this.stage.screenDimensions.height;

        // adjust for given distance in given direction
        coords2d.x += (direction.x * distance);
        coords2d.y -= (direction.y * distance);

        // smart adjust the reference point on the div based on given direction
        if ((-pi / 8 < angle) && (angle <= pi / 8)) {
            // "left mid"
            coords2d.y -= divHeight / 2;
        } else if ((pi / 8 < angle) && (angle <= (3 * pi / 8))) {
            // "left bottom"
            coords2d.y -= divHeight;
        } else if (((3 * pi / 8)) < angle && (angle <= (5 * pi / 8))) {
            // "bottom mid"
            coords2d.y -= divHeight;
            coords2d.x += -divWidth / 2;
        } else if (((5 * pi / 8) < angle) && (angle <= (7 * pi / 8))) {
            // "right bottom"
            coords2d.y -= divHeight;
            coords2d.x += -divWidth;
        } else if (((7 * pi / 8) < angle) || angle <= (-7 * pi / 8)) {
            // "right mid"
            coords2d.y -= divHeight / 2;
            coords2d.x += -divWidth;
        } else if (((-3 * pi / 8) < angle) && (angle <= (-pi / 8))) {
            // "left top"
        } else if (((-5 * pi / 8) < angle) && (angle <= (-3 * pi / 8))) {
            // "top mid"
            coords2d.x += -divWidth / 2;
        } else if (((-7 * pi / 8) < angle && angle <= (5 * pi / 8))) {
            // "right top"
            coords2d.x += -divWidth;
        }

        // update DOM element
        this.element.style.left = `${coords2d.x}px`;
        this.element.style.top = `${coords2d.y}px`;
    }

    _onMouseDown = (event) => {
        if (this.stage.smartRoofSetbackEditMode.enabled) {
            this.stage.textSelectionControls.setSelectedTextObject.bind(this.stage.textSelectionControls.onClick(event));
            this.stage.textSelectionControls.setSelectedTextObject.bind(this.onSelect());
        }
        this.stage.textSelectionControls.setSelectedTextObject(this);
    };

    _onCameraUpdate = () => {
        this._setPosition(this.position, this.direction, this.distance);
    };

    enableSelection = () => {
         if (!this.isSelectionEnabled) {
             this.element.addEventListener('mousedown', this._onMouseDown);
             this.isSelectionEnabled = true;
         }
    };

    disableSelection = () => {
        if (this.isSelectionEnabled) {
            this.element.removeEventListener('mousedown', this._onMouseDown);
            this.isSelectionEnabled = false;
        }
    };

    show(editable=true) {
        this.element.style.visibility = 'visible';
        if (editable){
            this.enableSelection();
            this.stage.eventBus.addEventListener(ENABLE_TEXT_SELECTION, this.enableSelection);
            this.stage.eventBus.addEventListener(DISABLE_TEXT_SELECTION, this.disableSelection);
        }
    }

    hide() {
        this.element.style.visibility = 'hidden';
        this.disableSelection();
        this.stage.eventBus.removeEventListener(ENABLE_TEXT_SELECTION, this.enableSelection);
        this.stage.eventBus.removeEventListener(DISABLE_TEXT_SELECTION, this.disableSelection);
    }

    // TODO: Create a move function that is not compute heavy
    update(text, position, angle, direction, distance, updateElementInnerText = true) {

        this.text = text !== undefined ? text : this.text;
        this.angle = angle !== undefined ? angle : this.angle;
        this.position = position !== undefined ? position : this.position;
        this.direction = direction !== undefined ? direction : this.direction;
        this.distance = distance !== undefined ? distance : this.distance;

        // text
        if (updateElementInnerText) {
            this.setElementInnerText(this.text);
        }

        // angle
        this.element.style.transformOrigin = '0 0';
        this.element.style.transform = `rotate(${-1 * this.angle}rad)`;

        // position
        this._setPosition(this.position, this.direction, this.distance);

    }

    remove() {
        if(this.stage.textSelectionControls.getSelectedTextObject() === this) {
            this.stage.textSelectionControls.deSelectSelectedTextObject();
        }

        if (this.domElement.contains(this.element)) {
            this.domElement.removeChild(this.element);
        }
    }

    enable() {
        this.element.style.removeProperty('opacity');
        this.element.removeAttribute('disabled');
        this.enableSelection();
    }

    disable(){
        this.element.style.opacity = '0.4';
        this.element.setAttribute('disabled', true);
        this.disableSelection();
    }

    onSelect({ shouldCreateContainer, shouldCompleteOnNoChange } = { shouldCreateContainer: true, shouldCompleteOnNoChange: false }) {
        this.stage.dragControls.disable();

        this.element.style.backgroundColor = 'black';
        this.element.style.color = 'white';
        this.element.style.zIndex = '1000';
        this.element.contentEditable = 'true';
        this.element.style.borderRadius = '0px';
        this.element.focus();

        // select text object on window
        let range = document.createRange();
        range.selectNodeContents(this.element);
        let selection = window.getSelection();
        // Remove any current selections on window if already there
        selection.removeAllRanges();
        // select currently selected range
        selection.addRange(range);

        this.element.removeEventListener('mousedown', this._onMouseDown);
        this.element.addEventListener('keyup', this._checkInput);

        this.parent.handleTextSelection();

        // store shouldCreateContainer
        this._shouldCreateContainer = shouldCreateContainer;
        this._shouldCompleteOnNoChange = shouldCompleteOnNoChange;

    }

    deSelect() {
        if (!this.stage.setbackEditMode.isEnabled()) {
            this.stage.dragControls.enable();
        }

        this.setElementInnerText(this.getElementInnerText());

        this.element.style.color = 'white';
        this.element.style.zIndex = '1';
        this.element.contentEditable = 'false';
        this.element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.element.style.borderRadius = '3px';
        this.element.blur();

        this.element.addEventListener('mousedown', this._onMouseDown);
        this.element.removeEventListener('keyup', this._checkInput);

        this.parent.handleTextDeSelection();
    }

    // use only in TextSelectionControls
    isValidInput() {
        let magnitude = this.getElementInnerText();
        let setbackValidation = true;
        if (this.stage.setbackEditMode.isEnabled() &&
            !this.stage.setbackEditMode.setbackValueValidator(magnitude)) {
            setbackValidation =  false;
        }
        
        if (!this.inputValidator(magnitude) ||
            !setbackValidation) {
            // TODO: Think of some other method
            return false;
        }
        return true;
    }
    getValidInput(magnitude){
        let res = magnitude;
        if (utils.isMetricUnit()) {
            res = parseFloat(magnitude);
            if(res < 0.001 ){
                return '0.001';
            }
        } else {
            if(this.parent instanceof ArcMeasurement || this.parent instanceof RotationPoint){
                return magnitude;
            }
            let feetArr = utils.parseImperialMeasurement(magnitude);
            res = (0.3048 * feetArr[0]) + (0.0254 * feetArr[1]);
            if(res < 0.001 ){
                res = 0.0393700788;
                return utils.stringifyImperialMeasurement(0,res);
            }
        }
        return magnitude;
    }


    async onComplete() {
        if(!this.valueChanged() && !this._shouldCompleteOnNoChange && utils.isMetricUnit()) {
            return true;
        }

        let magnitude = this.getValidInput(this.getElementInnerText());

        if (this.stage.setbackEditMode.isEnabled() &&
            !this.stage.setbackEditMode.setbackValueValidator(magnitude)) {
            this.stage.eventManager.customErrorMessage(
                'Setback value should be atleast 0.001',
                'Setback EditMode',
            );
            return false;
        }

        if (!this.inputValidator(magnitude) && utils.isMetricUnit()) {
            // TODO: Think of some other method
            this.parent.inputError();
            return false;
        }

        try {
            if (this._shouldCreateContainer &&
                !this.stage.setbackEditMode.isEnabled()) {
                this.stage.stateManager.startContainer();
            }
            await this.parent.handleValueUpdate(magnitude);
        }
        catch(e) {
            console.error("HTML Text: onComplete failed: "+e);
        }
        finally {
            if (this._shouldCreateContainer &&
                !this.stage.setbackEditMode.isEnabled()) {
                this.stage.stateManager.stopContainer();
            }
        }

        return true;

    }

    onCancel() {
        this.setElementInnerText(this.text);
        this.parent.handleOnCancel();
    }

    valueChanged() {
        return this.text !== this.getValidInput(this.getElementInnerText());
    }

    focus() {
        this.element.focus();
    }

    selectText() {
        // select text object on window
        let range = document.createRange();
        range.selectNodeContents(this.element);
        let selection = window.getSelection();
        // Remove any current selections on window if already there
        selection.removeAllRanges();
        // select currently selected range
        selection.addRange(range);
    }

    _checkInput = () => {
        const magnitude = this.getElementInnerText();    
        let setbackValidation = true;
        if (this.stage.setbackEditMode.isEnabled() &&
            !this.stage.setbackEditMode.setbackValueValidator(magnitude)) {
            setbackValidation =  false;
        }
        if(!this.inputValidator(magnitude) ||
            !setbackValidation){
            this.element.style.color = "red";
        }
        else{
            this.element.style.color = "white";
        }
    };

    getPosition() {
        return this.position;
    }
}
