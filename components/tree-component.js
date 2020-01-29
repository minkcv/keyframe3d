layout.registerComponent( 'treeComponent', function(container, componentState){
    container.getElement().html('<div class="tree-view" id=' + componentState.id + '></div>');
    container.on('open', function() {
        var autoOpen = true;
        $('#' + componentState.id).tree({
            data: componentState.data,
            autoOpen: autoOpen,
            dragAndDrop: true,
            selectable: true,
            slide: false,
            closedIcon: '+',
            openedIcon: '-'
        }).on('tree.click', function(event){
        });
    });
    var data;
    if (componentState.view == 'internal') {
        data = [
            {
                name: '388fb138', 
                children: [
                    { name: '0d60-48ec-827c' },
                    { name: '1148-4289-8414' },
                    { name: '6f18-4b15-83e7' },
                    { name: '4e15-4ad1-bcef' }
                ]
            },
            {
                name: '4cce5450',
                children: [
                    { name: '980c-4e81-982c' },
                    { name: '84e3-47c5-a503' },
                    { name: '1cb1-49be-9bb5' }
                ]
            },
            {
                name: 'dd8c59ee',
                children: [
                    { name: '1200-4dc7-9693' },
                    { name: '0798-4283-8fa1' },
                    { name: '4d2e-4c90-8fee' },
                    { name: 'fae3-4076-9613' }
                ]
            }
        ];
    }
    else if(componentState.view == 'external') {
        data = [
            {
                name: 'ffd0418bd683', external: true,
                children: [
                    { name: '8487-47e6-adc9', external: true },
                    { name: '9987-4d79-b01d', external: true }
                ]
            },
            {
                name: 'ea5896079b96', external: true,
                children: [{ name: '6e5e-4c48-9429', external: true }]
            }
        ];
    }
    else if (componentState.view == 'code') {
        data = [
            {
                name: '.code_segment', code: true,
                children: [
                    { name: 'CMDR.sys', code: true, id: 0 },
                    { name: 'MDVR.sys', code: true, id: 1 },
                    { name: 'LNDR.sys', code: true, id: 2 },
                    { name: 'HWND.sys', code: true, id: 3 }
                ]
            }
        ]
    }
    componentState.data = data;
});
