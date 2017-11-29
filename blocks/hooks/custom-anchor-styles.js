
/**
 * Internal dependencies
 */
import { Component } from '@wordpress/element';
import { getBlockRandomAnchor, hasBlockSupport, getBlockType } from '../api';

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
	if ( hasBlockSupport( props.name, 'anchor' ) ) {
		const blockType = getBlockType( props.name );
		if ( CUSTOM_STYLE_ATTRIBUTES.some( attr => blockType.attributes[ attr ] ) ) {
			element = [ element, <AddAnchorWhenNeeded key="add-anchor" { ...props } /> ];
		}
	}
	return element;
}

export default function customAnchorStyles( { addFilter } ) {
	addFilter( 'BlockEdit', 'core-anchor-inspector-control', addAnchorWhenStylesNeed );
}
