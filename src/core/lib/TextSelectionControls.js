import { isMetricUnit, stringifyFromMetricMeasurement } from '../../components/ui/length/utils';
import { ENABLE_TEXT_SELECTION, DISABLE_TEXT_SELECTION, SETBACKDROPDOWNLIST, ZERO_INCH_SETBACK, THIRTYSIX_INCH_SETBACK, EIGHTEEN_INCH_SETBACK } from '../coreConstants';

export default class TextSelectionControls {
    constructor(stage) {
        // standard norms
        this.stage = stage;

        this.selectedTextObject = undefined;
        this.selectionEnabled = true;
        this.selected = -1;
        this.reSelectable = true;
    }

    async _onComplete() {
        const textObject = this.selectedTextObject;
        if (this.selectedTextObject.isValidInput()) {
            this.deSelectSelectedTextObject({ ignoreValueChange: true });
        }
        await textObject.onComplete();
    }

    _onCancel() {
        const selectedTextObject = this.selectedTextObject;
        this.deSelectSelectedTextObject({ ignoreValueChange: true });
        selectedTextObject.onCancel();
    }

    enable() {
        if (!this.selectionEnabled) {
            this.stage.eventBus.dispatchEvent({ type: ENABLE_TEXT_SELECTION });
            this.selectionEnabled = true;
        }
    }

    disable() {
        if (this.selectionEnabled) {
            this.stage.eventBus.dispatchEvent({ type: DISABLE_TEXT_SELECTION });
            this.selectionEnabled = false;
        }
    }

    onClick = (event) => {
        this.doubleClick = false;
        setTimeout(this.handleClick.bind(this, event), 20);
    }

    handleClick(event) {
        this.stage.eventManager.showSelectionContextMenu(event,
            this.getNames(),
            this.selectionControl.bind(this),
            this.getDefault());
    }
    getNames () {
        return SETBACKDROPDOWNLIST;
    }

    getDefault() {
        return this.selected;
    }

    // selection of setback values from dropdown when text is clicked in setbackEditMode
    selectionControl(i) {
        this.selected = i;
        if (i == 0){
            if (isMetricUnit()) {
                this.selectedTextObject.text = ZERO_INCH_SETBACK;
            }
            else{
                this.selectedTextObject.text = stringifyFromMetricMeasurement(ZERO_INCH_SETBACK);
            }
        }
        else if (i == 1) {
            if (isMetricUnit()) {
                this.selectedTextObject.text = EIGHTEEN_INCH_SETBACK;
            }
            else{
                this.selectedTextObject.text = stringifyFromMetricMeasurement(EIGHTEEN_INCH_SETBACK);
            }
        }
        else if (i == 2){
            if (isMetricUnit()) {
                this.selectedTextObject.text = THIRTYSIX_INCH_SETBACK;
            }
            else{
                this.selectedTextObject.text = stringifyFromMetricMeasurement(THIRTYSIX_INCH_SETBACK);
            };
        }
        // update the text with the selected dropDown value
            this.selectedTextObject.update(this.selectedTextObject.text, this.selectedTextObject.position, this.selectedTextObject.angle, this.selectedTextObject.direcction, this.selectedTextObject.distance, true);
            this.selectedTextObject.deSelect();
            this.selectedTextObject.onComplete();
    }

    getSelectedTextObject() {
        return this.selectedTextObject;
    }

    setSelectedTextObject(textObject, { shouldCreateContainer, shouldCompleteOnNoChange } = { shouldCreateContainer: true, shouldCompleteOnNoChange: false }) {
        if (this.stage.smartRoofSetbackEditMode.enabled) {
            this.reSelectable = false;
        }

        // deselect selected object
        if (!this.deSelectSelectedTextObject()) {
            return false;
        }

        if (textObject === this.selectedTextObject) {
            console.warn('WARN: TextSelectionControls: textObject already selected in setSelectedTextObject');
            return true;
        }


        // select element
        textObject.onSelect({ shouldCreateContainer, shouldCompleteOnNoChange });

        // change selected text object
        this.selectedTextObject = textObject;

        // update complete and cancel button status
        this.stage.eventManager.setButtonsStatusOnTextSelect(this._onComplete.bind(this), this._onCancel.bind(this), this.selectedTextObject);

        return true;
    }

    deSelectSelectedTextObject({ ignoreValueChange } = { ignoreValueChange: false }) {
        this.selected = -1;
        this.stage.eventManager.hideSelectionContextMenu();
        if (this.selectedTextObject !== undefined) {
            // check for value change
            if (!ignoreValueChange && this.selectedTextObject.valueChanged() && this.reSelectable) {
                this.stage.eventManager.setTextValueChanged();
                this.selectedTextObject.focus();
                return false;
            }

            this.selectedTextObject.deSelect();
            this.selectedTextObject = undefined;

            this.stage.eventManager.setButtonsStatusOnHomeState();

            return true;
        }

        return true;
    }
}
