import Ember from 'ember';
import layout from '../templates/components/svg-icon';
import { getSvgData } from '../utils/general';

const iconsList = {
    asterisk: 'asterisk',
    ban: 'no-access',
    checkmark: 'checkmark',
    pencil: 'edit',
    partial: 'partial-access',
    trash: 'trashcan',
    // this probably is not right, but using it for now
    questionmark: 'lock-unknown'
};

const UNKNOWN_ICON = iconsList.questionmark;

/**
 * Returns path for the specified icon
 *
 * @param {string} icon - Icon name
 * @returns {string}
 *
 * @private
 * @static
 * @memberof SvgIconComponent
 * @this SvgIconComponent
 */
function getPathForIcon(icon) {
    let iconToUse = iconsList[icon];

    if (!iconToUse) {
        Ember.Logger.warn(`No icon in icon list for ${icon}`);
        // use unknown one
        iconToUse = UNKNOWN_ICON;
    }

    // all icons should be in the right path, so this should just be the icon name
    return iconToUse;
}

/**
 * <p>Component for generating SVG icons by specifying the icon name.</p>
 * Properties that can be specified:
 * <ul>
 *     <li><strong>icon</string> - name of the icon to generate</li>
 *     <li><strong>class</string> - class(es) to be added to the generated svg element</li>
 *     <li><strong>height</string> - height for the svg element, will override the original icon height</li>
 *     <li><strong>width</string> - width for the svg element, will override the original icon width</li>
 * </ul>
 *
 * @class SvgIconComponent
 * @extends Ember.Component
 */
export default Ember.Component.extend(/** @lends SvgIconComponent.prototype */{
    layout: layout,

    /**
     * Element's HTML tag name
     *
     * @type {string}
     */
    tagName: 'svg',

    /**
     * Class names that will be added to the element
     *
     * @type {string[]}
     */
    classNames: ['svgi'],

    /**
     * <p>Sets up all the properties for the icons.</p>
     * <strong>Note:</strong> Doing it this way, with the hope to minimize the binding requirements.
     */
    didReceiveAttrs() {
        const path = this.getAttr('path') || '';
        const iconName = this.getAttr('icon') || '';

        const svgData = getSvgData(path || getPathForIcon(iconName));

        // doing deep copy of attributes so that we do not change the original icon definition
        // this is supposed to be faster than deep copy of jQuery.extend
        const attributes = JSON.parse(JSON.stringify(svgData.attributes || {}));

        const height = this.getAttr('height') | 0;
        const width = this.getAttr('width') | 0;

        // if we got height passed in, then that takes precedence
        if (height) {
            attributes['height'] = height;
        }

        // if we got width passed in, then that takes precedence
        if (width) {
            attributes['width'] = width;
        }

        // set the inner svg
        this.set('innerSvg', svgData.innerSvg);
        // set the attributes (we need this for the attribute binding)
        this.set('attributes', attributes);

        // bind attributes
        const attributeBindings = this.get('attributeBindings');

        // wish there was a way how to just set them without binding, but cannot figure that out
        Object.keys(attributes).forEach(key => {
            attributeBindings.push(`attributes.${key}:${key}`);
        });
    }
});
