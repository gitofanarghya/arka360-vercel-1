import * as THREE from 'three';
import {
    getTemplate,
    getSubarrayPropertiesFromSubarray,
} from './utils/dataUtils';
import mergeAll from './utils/mergeMeshes';
import createStructureFromTemplate from './utils/templateUtils';
import createArkaStructureFromTemplate from './utils/gazeboUtils'

/**
 * It creates structure
 * @param {*appParams subarrayList and structure design template}
 */
export default async function createStructure(appParams) {
    const objectsGroup = new THREE.Group();
    const arkaPergolaObjectsGroup = new THREE.Group();
    const { subarrayList, structureDesignTemplate } = appParams;

    for (let i = 0; i < subarrayList.length; i += 1) {
        const subarray = subarrayList[i];
        if (subarray.structureType !== undefined && subarray.structureType !== null && subarray.isStructureRequired()) {
            const template = getTemplate(subarray.structureType);
            const subarrayProperties = getSubarrayPropertiesFromSubarray(subarray);

            if (subarray.getStructureErrors().length === 0) {
                const boundingBoxes = [];
                const rows = subarray.getChildren();
                for (let j = 0; j < rows.length; j += 1) {
                    boundingBoxes.push([...rows[j].get3DBoundingBoxesExcludingHiddenTables()]);
                }
                if(template.NAME == 'PGUS01-01M1-77- 5x9' || template.NAME == 'PGUS01-01M1-77- 4x8' || template.NAME == 'PGUS01-01M1-77- 5x8' || template.NAME == 'PGUS01-01M1-77- 6x8' || template.NAME == 'PGUS01-01M1-77- 7x8'){
                    const params = [
                        rows,
                        boundingBoxes,
                        subarrayProperties,
                        arkaPergolaObjectsGroup,
                        template.NO_OF_LEGS,
                    ];
                    createArkaStructureFromTemplate[template.NAME](params, template)
                }
                else{
                    const params = [
                        rows,
                        boundingBoxes,
                        subarrayProperties,
                        objectsGroup,
                    ];
                    await createStructureFromTemplate[template.NAME](params, template)
                }
            }
        }
    }
    const mergedMeshGroup = mergeAll(objectsGroup);
    mergedMeshGroup.add(arkaPergolaObjectsGroup);
    return mergedMeshGroup;
}

