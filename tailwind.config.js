
module.exports = {
  mode: 'jit',
  purge: {
    content: [
      'resources/views/*.edge',
      'resources/views/*/*.edge',
      'resources/views/*/*/*.edge'
    ],
    safelist: [
      'rotate-180',
      'rotate-0',
      'hidden',
      'block',
      'input-bordered',
      'textarea-error',
      'bg-opacity-10',
      'pl-12',
      'input-success',
      'text-success',
      'input-error',
      'input-primary',
      'text-error',
      'animate-reverse-spin',
      'select-error',
      'select-primary',
      'w-16',
      'input-warning',
      'bg-warning'
    ]
  },
  // purge: {
  //   content: [
  //     'resources/views/*.edge',
  //     'resources/views/*/*.edge'
  //   ],
  //   options: {
  //     safelist: [
  //       /data-theme$/,
  //     ]
  //   }
  // },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily:{
        'great-vibes': ['Great Vibes', 'cursive'],
        'libre-baskerville': ['Libre Baskerville', 'serif']
      },
      backgroundImage:{
        'background-leo': "url('../images/background-leo.png')",
        'jewel-pattern': "url('../images/svg/jewel-pattern.svg')",
        'triangle-pattern': "url('../images/svg/triangle-pattern.svg')",
        'placeholder-user-100': "url('../images/placeholder/placholder-user-100x100.png')",
        'placeholder-user-200': "url('../images/placeholder/placholder-user-200x200.png')"
      },
      colors: {
        // pallete 1
        'custom-prussian-blue' : "#023047",
        'custom-blue-green': "#219EBC",
        'custom-light-cornflower': "#8ECAE6",
        'custom-yellow-honey': "#FFB703",
        'custom-orange': "#FFB703",
        // pallete 2
        'custom-brink-pink': "$ff6384",
        'custom-california-blue': "#36a2eb"
      },
      scale: {
        flip: '-1',
      },
      animation: {
        'reverse-spin': 'reverse-spin 1s linear infinite'
      },
      keyframes: {
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)'
          },
        }
      }
    },
  },
  variants: {
    extend: {},
  },

  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    styled: true,
    themes: [
      // {
      //   'skripsi-pos' :  {                 /* your theme name */
      //     'primary' : '#570df8',           /* Primary color */
      //     'primary-focus' : '#8462f4',     /* Primary color - focused */
      //     'primary-content' : '#ffffff',   /* Foreground content color to use on primary color */

      //     'secondary' : '#f6d860',         /* Secondary color */
      //     'secondary-focus' : '#f3cc30',   /* Secondary color - focused */
      //     'secondary-content' : '#ffffff', /* Foreground content color to use on secondary color */

      //     'accent' : '#37cdbe',            /* Accent color */
      //     'accent-focus' : '#2aa79b',      /* Accent color - focused */
      //     'accent-content' : '#ffffff',    /* Foreground content color to use on accent color */

      //     'neutral' : '#3d4451',           /* Neutral color */
      //     'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
      //     'neutral-content' : '#ffffff',   /* Foreground content color to use on neutral color */

      //     'base-100' : '#ffffff',          /* Base color of page, used for blank backgrounds */
      //     'base-200' : '#f9fafb',          /* Base color, a little darker */
      //     'base-300' : '#d1d5db',          /* Base color, even more darker */
      //     'base-content' : '#1f2937',      /* Foreground content color to use on base color */

      //     'info' : '#2094f3',              /* Info */
      //     'success' : '#009485',           /* Success */
      //     'warning' : '#ff9900',           /* Warning */
      //     'error' : '#ff5724',             /* Error */
      //  }
      // },
      // 'light', // first one will be the default theme
      'corporate',
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}

// module.exports = {
//   mode: 'jit',
//   purge: [
//     './resources/views/*.edge',
//     './resources/js/app.js'
//   ],
//   darkMode: false, // or 'media' or 'class'
//   theme: {
//     extend: {},
//   },
//   variants: {
//     extend: {},
//   },
//   plugins: [],
// }
