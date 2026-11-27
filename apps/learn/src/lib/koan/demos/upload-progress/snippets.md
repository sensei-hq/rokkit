## Basic — mixed statuses {#intro}

```svelte
<script>
  import { UploadProgress } from '@rokkit/ui'

  const files = $state([
    { id: '1', label: 'spec.pdf',  size: 240_000,   progress: 100, status: 'completed' },
    { id: '2', label: 'logo.svg',  size: 12_000,    progress: 64,  status: 'uploading' },
    { id: '3', label: 'video.mp4', size: 8_400_000, progress: 0,   status: 'failed', error: 'Network timeout' }
  ])
</script>

<UploadProgress
  {files}
  cancelWhen={['uploading']}
  retryWhen={['failed']}
  removeWhen={['completed', 'failed']}
/>
```

## Grid view {#grid}

```svelte
<UploadProgress files={images} view="grid" />
```
