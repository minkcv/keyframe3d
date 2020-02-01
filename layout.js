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
            width: 35,
            content:[{
                type: 'column',
                content:[{
                    type: 'stack',
                    height: 20,
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
                
            },{
                type: 'column',
                content:[{
                    type: 'component',
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
                height: 18,
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
