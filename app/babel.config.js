module.exports = {
    "presets": [
        "@babel/preset-env",
        '@babel/preset-typescript',
        "@vue/cli-plugin-babel/preset"
        
    ],
    "plugins": [
        [
            "component",
            {
                "libraryName": "element-plus",
                "styleLibraryName": "theme-chalk"
            }
        ]
    ],
    'env': {
        'test': {
          'presets': [
            [
              '@babel/preset-env',
              {
                'targets': {
                  'node': 8,  // <- ADDED
                },
              }
            ],
            '@babel/typescript',
          ]
        },
    }         
};