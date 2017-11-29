
/**
 * Internal dependencies
 */
import { Component } from '@wordpress/element';
import { getBlockRandomAnchor } from '../api';

const CUSTOM_STYLE_ATTRIBUTES = [ 'backgroundColor', 'textColor' ];

class AddAnchorWhenNeeded extends Component {
	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.attributes.anchor && CUSTOM_STYLE_ATTRIBUTES.some( attr => nextProps.attributes[ attr ] ) ) {
			nextProps.setAttributes( {
				anchor: getBlockRandomAnchor( nextProps.name ),
			} );
		}
	}

	render() {
		return null;
	}
}

export function addAnchorWhenStylesNeed( element, props ) {
	return [ element, <AddAnchorWhenNeeded key="add-anchor" { ...props } /> ];
}

export default function customAnchorStyles( { addFilter } ) {
	addFilter( 'BlockEdit', 'core-anchor-inspector-control', addAnchorWhenStylesNeed );
}
