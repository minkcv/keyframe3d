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
                componentName: 'treeComponent',
                componentState: { view: 'internal', id: '0' },
                isClosable: false,
                title: 'Internal System'
            },{
                type: 'component',
                height: 20,
                componentName: 'treeComponent',
                componentState: { view: 'external', id: '1' },
                isClosable: false,
                title: 'External System'
            },{
                type: 'component',
                height: 20,
                componentName: 'treeComponent',
                componentState: { view: 'code', id: '2' },
                isClosable: false,
                title: 'Code System'
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
