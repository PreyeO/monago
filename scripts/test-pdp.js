#!/usr/bin/env node
// Show amwayGallery structure from saved pdp-debug.json
const fs   = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'pdp-debug.json'), 'utf8'));
const pd   = data?.props?.initialStateOrStore?.PDPState?.productData;

console.log('=== amwayGallery ===');
for (const [i, gallery] of (pd?.amwayGallery ?? []).entries()) {
  console.log(`\nGallery[${i}]: type=${gallery.type}, localizedType=${gallery.localizedType}`);
  for (const r of gallery.renditions ?? []) {
    console.log(`  rendition: format=${r.format}, url=${r.url}`);
  }
}

console.log('\n=== images array (first 5) ===');
for (const img of (pd?.images ?? []).slice(0, 5)) {
  console.log(`  format=${img.format}, url=${img.url}`);
}
