## Save the wizard’s output to localStorage {#save-preset}

```js
import {
  savePreset,
  exportTokensCss
} from '#lib/koan/demos/theme-wizard/store.svelte.ts'

// Persist the current role-step map under the named preset
savePreset('my-brand')

// Generate the tokens.css string for the active selection
const css = exportTokensCss()
console.log(css)
```

## Apply a saved preset at runtime {#apply-preset}

```ts
import { vibe } from '@rokkit/states'

vibe.style = 'zen-sumi'  // style theme
vibe.mode = 'dark'       // light | dark
vibe.density = 'compact' // compact | cozy | comfortable
```
