var config = {
    settings: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false
    },
    content: [{
        type: 'row',
        content:[{
            type: 'column',
            width: 10,
            content:[{
                type: 'component',
                componentName: 'fileComponent',
                componentState: {},
                isClosable: false,
                title: 'File'
            },{
                type: 'component',
                height: 70,
                componentName: 'treeComponent',
                componentState: {},
                isClosable: false,
                title: 'Scene Tree'
            }]
        },{
            type: 'column',
            content:[{
                type: 'row',
                content: [{
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
    }]
};
var layout = new GoldenLayout(config);
