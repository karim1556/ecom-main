const fs = require('fs');
const { PNG } = require('pngjs');

const file = 'public/images/Logo.png';

fs.createReadStream(file)
  .pipe(new PNG())
  .on('parsed', function () {
    let r=0,g=0,b=0,count=0;
    for (let y=0; y<this.height; y++){
      for (let x=0; x<this.width; x++){
        const idx = (this.width*y + x) << 2;
        const alpha = this.data[idx+3];
        if (alpha === 0) continue;
        r += this.data[idx];
        g += this.data[idx+1];
        b += this.data[idx+2];
        count++;
      }
    }
    if (count===0){
      console.error('No non-transparent pixels found');
      process.exit(1);
    }
    r = Math.round(r/count);
    g = Math.round(g/count);
    b = Math.round(b/count);
    const toHex = (v) => v.toString(16).padStart(2,'0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    // create a lighter variant (blend 70% original + 30% white)
    const lighten = (v) => Math.round(v * 0.7 + 255 * 0.3);
    const lr = lighten(r), lg = lighten(g), lb = lighten(b);
    const lightHex = `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;

    console.log('SAMPLED_COLOR_MAIN=' + hex);
    console.log('SAMPLED_COLOR_LIGHT=' + lightHex);
  });
