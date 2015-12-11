import SVGs from '../svgs';
import { setSVGs } from 'ember-inline-svg/utils/general';

// set the SVGs on the addon
setSVGs(SVGs);

// export the actual component
export { default } from 'ember-inline-svg/components/svg-icon';