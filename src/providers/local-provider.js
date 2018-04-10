import Provider from './provider.js';

import image1 from '../../assets/1.gif';
import image2 from '../../assets/2.gif';
import image3 from '../../assets/3.gif';
import image4 from '../../assets/4.gif';
import image5 from '../../assets/5.gif';
import image6 from '../../assets/6.gif';
import image7 from '../../assets/7.gif';
import image8 from '../../assets/8.gif';
import image9 from '../../assets/9.gif';
import image10 from '../../assets/10.gif';

export default class LocalProvider extends Provider {
  constructor(options = {}) {
    super(options);
  }

  load(count) {
    return new Promise(resolve => {
      resolve([
        image1,
        image2,
        image3,
        image4,
        image5,
        image6,
        image7,
        image8,
        image9,
        image10,
      ]);
    });
  }
}