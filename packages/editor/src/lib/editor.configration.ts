export const CONFIGRATION_ALL = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block', 'formula'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        // [{ font: [] }],
        [{ align: [] }],
        ['clean'],
        ['link', 'emoji', 'image']
    ]
};

export const CONFIGRATION_SIMPLE = {
    toolbar: [
        ['bold', 'italic'],
        ['blockquote', 'code-block', 'formula'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'emoji', 'image']
    ]
};

export const CONFIGRATION_TYPE = {
    simple: CONFIGRATION_SIMPLE,
    all: CONFIGRATION_ALL
};

export const CONFIGRATION_DEFAULT = 'simple';

export const CONFIGRATION = {
    debug: false,
    format: 'html',
    modules: {
        'emoji-shortname': true,
        'emoji-textarea': false,
        'emoji-toolbar': true,
        formula: true,
        imageResize: {},
        syntax: true,
        toolbar: CONFIGRATION_SIMPLE
    },
    placeholder: '请输入...',
    readOnly: false
};

export const CONFIGRATION_STYLE_DEFAULT = { 'min-height': '200px', 'max-height': '600px', overflow: 'auto' };

export const CONFIGRATION_TOOLBAR_POSITION = {
    TOP: 'top',
    BOTTOM: 'bottom'
};
