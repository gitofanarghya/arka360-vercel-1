const reportTwoAssets = import.meta.glob('../reportTwo/assets/img/*', { eager: true, as: 'url' })
const reportThreeAssets = import.meta.glob('../reportThree/assets/img/*', { eager: true, as: 'url' })

function modifyComponentData(apiData, reportFolder) {
    let imgFilesDict
    if (reportFolder == 'reportTwo' || reportFolder == 'reportDefault') {
        imgFilesDict = {
            'Modules':  reportTwoAssets['../reportTwo/assets/img/Modules.png'],
            'Inverters':  reportTwoAssets['../reportTwo/assets/img/battery1.png'],
            'Structure':  reportTwoAssets['../reportTwo/assets/img/Structure.png'],
            'Walkways':  reportTwoAssets['../reportTwo/assets/img/Walkways.png'],
            'ACDB':  reportTwoAssets['../reportTwo/assets/img/ACDB.png'],
            'AC Cable':  reportTwoAssets['../reportTwo/assets/img/ACCable.png'],
            'DC Cable':  reportTwoAssets['../reportTwo/assets/img/DCCable.png'],
            'DCDB':  reportTwoAssets['../reportTwo/assets/img/DCDB.png'],
            'LA':  reportTwoAssets['../reportTwo/assets/img/LA.png'],
            'Lifeline':  reportTwoAssets['../reportTwo/assets/img/Lifeline.png'],
            'Earthing Pit':  reportTwoAssets['../reportTwo/assets/img/EarthingPit.png'],
            'Railings':  reportTwoAssets['../reportTwo/assets/img/Railings.png'],
            'Connectors':  reportTwoAssets['../reportTwo/assets/img/Connectors.png'],
            "Cable Conuits":  reportTwoAssets['../reportTwo/assets/img/CableConduits.png'],
            'Elbows':  reportTwoAssets['../reportTwo/assets/img/Elbows.png'],
            'Tees':  reportTwoAssets['../reportTwo/assets/img/Tees.png'],
            "Monitoring Solution":  reportTwoAssets['../reportTwo/assets/img/MonitoringSolution.png'],
            'Coupler':  reportTwoAssets['../reportTwo/assets/img/Coupler.png'],
            'Battery':  reportTwoAssets['../reportTwo/assets/img/battery1.png'],
            'Safetyline':  reportTwoAssets['../reportTwo/assets/img/Safetyline.png'],
        }
    } else if (reportFolder == 'reportThree') {
        imgFilesDict = {
            'Modules':  reportThreeAssets['../reportThree/assets/img/Modules.svg'],
            'Inverters':  reportThreeAssets['../reportThree/assets/img/inverters.svg'],
            'Structure':  reportThreeAssets['../reportThree/assets/img/structure.svg'],
            'Walkways':  reportThreeAssets['../reportThree/assets/img/walkways.svg'],
            'ACDB':  reportThreeAssets['../reportThree/assets/img/ACDB.png'],
            'AC Cable':  reportThreeAssets['../reportThree/assets/img/ACCable.png'],
            'DC Cable':  reportThreeAssets['../reportThree/assets/img/DCCable.png'],
            'DCDB':  reportThreeAssets['../reportThree/assets/img/DCDB.png'],
            'LA':  reportThreeAssets['../reportThree/assets/img/LA.png'],
            'Lifeline':  reportThreeAssets['../reportThree/assets/img/Lifeline.png'],
            'Earthing Pit':  reportThreeAssets['../reportThree/assets/img/EarthingPit.png'],
            'Railings':  reportThreeAssets['../reportThree/assets/img/Railings.png'],
            'Connectors':  reportThreeAssets['../reportThree/assets/img/Connectors.png'],
            "Cable Conuits":  reportThreeAssets['../reportThree/assets/img/CableConduits.png'],
            'Elbows':  reportThreeAssets['../reportThree/assets/img/Elbows.png'],
            'Tees':  reportThreeAssets['../reportThree/assets/img/Tees.png'],
            "Monitoring Solution":  reportThreeAssets['../reportThree/assets/img/MonitoringSolution.png'],
            'Coupler':  reportThreeAssets['../reportThree/assets/img/Coupler.png'],
            'Battery':  reportThreeAssets['../reportThree/assets/img/battery.png'],
            'Safetyline':  reportThreeAssets['../reportThree/assets/img/Safetyline.svg'],
        }
    }

    let componentArray = []
    Object.keys(apiData.components).forEach(key => {
        if (key != 'components' && key != 'manual_bom_data' && key != "Racking System" && key != 'BOS') {
            let comp = apiData.components[key]
            if (!comp.length) { return }
            
            for (let subComp of comp) {
            if(subComp.length == 2){
                subComp.push("No.");
            }
            if (subComp[1].trim) { subComp[1] = subComp[1].trim() }
            }

            let iconFile = imgFilesDict[key] || imgFilesDict['Walkways']

            let newComp = {
            comp: key,
            subComps: comp,
            iconFile: iconFile
            }
            componentArray.push(newComp)
        }
    })

    // Manual Component Data
    if (apiData.components['manual_bom_data']) {
        Object.keys(apiData.components['manual_bom_data']).forEach(compKey => {
            let iconFile = imgFilesDict[compKey] || imgFilesDict['Walkways']
            let subComps = apiData.components['manual_bom_data'][compKey].map(subComp => [subComp.make, subComp.quantity, ""])
            let newComp = {
                comp: compKey,
                subComps: subComps,
                iconFile: iconFile
            }
            Object.keys(newComp).forEach(function(key) {            
                for(let i=0;i<newComp['subComps'].length;i++){
                    if(newComp['subComps'][i][1].includes("nos")){
                        newComp['subComps'][i][1] = parseFloat(newComp['subComps'][i][1].split(' ')[0]).toFixed(2) + " No."
                    }
                }
              });
            componentArray.push(newComp)
        })
    }

    // if (reportFolder == 'reportTwo') {
    //     let oldCompArray = componentArray;
    //     componentArray = [];
    //     while (oldCompArray.length) componentArray.push(oldCompArray.splice(0,2));
    // }


    return componentArray
}

export default modifyComponentData