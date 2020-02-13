var config = {
    settings: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false
    },
    content: [{
        type: 'row',
        content:[{
            type: 'row',
            width: 32,
            content:[{
                type: 'column',
                content:[{
                    type: 'stack',
                    height: 24,
                    content:[{
                        type: 'component',
                        componentName: 'fileComponent',
                        componentState: {},
                        isClosable: false,
                        title: 'File'
                    },{
                        type: 'component',
                        componentName: 'settingsComponent',
                        componentState: {},
                        isClosable: false,
                        title: 'Settings'
                    }]
                },{
                    type: 'component',
                    height: 20,
                    componentName: 'treeControlsComponent',
                    componentState: {},
                    isClosable: false,
                    title: 'Scene Tree Controls'
                },{
                    type: 'stack',
                    content: [{
                        type: 'component',
                        componentName: 'treeComponent',
                        componentState: {},
                        isClosable: false,
                        title: 'Scene Tree'
                    },{
                        type: 'component',
                        componentName: 'modelComponent',
                        componentState: {},
                        isClosable: false,
                        title: 'Models'
                    }]
                }]
                
            },{
                type: 'column',
                width: 50,
                content:[{
                    type: 'component',
                    height: 35,
                    componentName: 'propertiesComponent',
                    componentState: {},
                    isClosable: false,
                    title: 'Properties'
                },{
                    type: 'component',
                    componentName: 'controlsComponent',
                    componentState: {},
                    isClosable: false,
                    title: 'Controls'
                }]
            }]
        },{
            type: 'column',
            content:[{
                type: 'stack',
                content:[{
                    type: 'component',
                    componentName: 'viewportComponent',
                    componentState: { viewportId: 0 },
                    isClosable: false,
                    title: 'Viewport 0'
                }]
            },{
                type: 'stack',
                height: 15,
                content:[{
                    type: 'component',
                    componentName: 'timelineComponent',
                    componentState: {  },
                    isClosable: false,
                    title: 'Timeline'
                },{
                    type: 'component',
                    componentName: 'logComponent',
                    componentState: {  },
                    isClosable: false,
                    title: 'Log'
                }]
            }]
        }]
    }]
};
var layout = new GoldenLayout(config);
