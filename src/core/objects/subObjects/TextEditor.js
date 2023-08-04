import * as THREE from 'three';
import { updateText, calculateHorizontalWrappingLimit } from './textUtils';

export default class TextEditor {
    constructor(stage) {
        this.stage = stage;
        this.name = 'Text Editor';

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.editorEnabled = false;

        this.currentTextObject = {};

        this.initialState = {};

        this.textCursorMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide,
        });

        this.textCursorMesh = new THREE.Mesh(
            new THREE.BufferGeometry(),
            this.textCursorMaterial,
        );
        
        this.objectsGroup.add(this.textCursorMesh);
    }

    enable() {
        // when this is enabled we need to disable all other events for the app.
        if (!this.editorEnabled) {
            this.editorEnabled = true;
            document.addEventListener('keydown', this.handleKeyInput, false);
        }
        else {
            console.error('already enabled.');
        }
    }

    disable() {
        if (this.editorEnabled) {
            this.editorEnabled = false;
            document.removeEventListener('keydown', this.handleKeyInput, false);
        }
        else {
            console.error('already disabled.');
        }
    }

    async initialize(textBox) {
        this.currentTextObject = textBox;
        this.previosTextGeometry = textBox.textMesh.geometry;
        this.previousText = textBox.text;
        this.previousWrapLimit = textBox.wrappingLimit;
        this.previousOutlinePoints = textBox.outlinePoints.map(outlinePoint => [
            outlinePoint.getPosition().x,
            outlinePoint.getPosition().y,
            outlinePoint.getPosition().z,
        ]);

        this.initialState = textBox.getState();

        this.enable();

        // disable all other active managers
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.controlsManager.disableQuickLook();
        this.stage.viewManager.unbindXRayVision();

        this.stage.eventManager.setButtonStatusWhileTextEdit(
            this.onSave.bind(this),
            this.onCancel.bind(this),
            this,
        );
    }

    reset() {
        this.currentTextObject = {};
        this.initialState = {};
    }

    onSave() {
        this.currentTextObject.saveState();
        this.exitTextEditor();
    }

    onCancel() {
        this.currentTextObject.loadState(this.initialState);
        this.exitTextEditor();
    }

    exitTextEditor({ discard } = { discard: false}) {
        this.disable();
        this.reset();

        // enable all disabled managers
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.controlsManager.enableQuickLook();
        this.stage.viewManager.bindXRayVision();
        
        this.stage.eventManager.onExitTextEditor();
        this.stage.stateManager.stopContainer({ discard });
    }

    handleKeyInput = (event) => {
        //disable quick look feature while this is active
        if (document.activeElement === document.getElementById('font_size')
        || document.activeElement === document.getElementById('shape_size')) {
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                break;
            case "ArrowUp":
                break;
            case "ArrowLeft":
                break;
            case "ArrowRight":
                break;
            case "Enter":
                break;
            case "Escape":
                break;
            case "Shift":
                break;
            case "CapsLock":
                break;
            case "Tab":
                break;
            case "Meta":
                break;
            case "AltGraph":
                break;
            case "Alt":
                break;
            case "FnLock":
                break;
            case "Fn":
                break;
            case "Control":
                break; 
            case "Delete":
                break; 
            case "Backspace":
                this.clearText();
                break;
            default:
                this.changeText(event.key)
                return;
        }

        event.preventDefault();
    };

    async clearText() {
        this.currentTextObject.text = this.currentTextObject.text
            .substring(0, this.currentTextObject.text.length - 1);
        this.currentTextObject.textForUpdate = this.currentTextObject.textForUpdate
            .substring(0, this.currentTextObject.textForUpdate.length - 1);
        // if (this.currentTextObject.lineText) {
        //     this.currentTextObject.lineText = this.currentTextObject.lineText
        //         .substring(0, this.currentTextObject.lineText.length - 1);
        // }
        // else {
        //     this.currentTextObject.lineText = this.currentTextObject.text;
        // }
        
        await updateText(this.currentTextObject,{updateTextBox: true});

        return false;
    }

    async changeText(ch) {
        // var ch = String.fromCharCode( keyCode );
        this.currentTextObject.text += ch;
        // Calculate Bounding Dimension for single character
        // to decide the wrap length: BoxWidth / LetterWidth
        calculateHorizontalWrappingLimit(ch, this.currentTextObject);

        try {
            await updateText(this.currentTextObject);
        }
        catch (error) {
            console.log('called on error');
        }
    }
}
