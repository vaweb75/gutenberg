/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
// import { concatChildren } from 'element';

/**
 * Internal dependencies
 */
import './block.scss';
import { registerBlockType, query as hpq } from '../../api';
import Editable from '../../editable';

const { children } = hpq;

registerBlockType( 'core/subtitle', {
	title: __( 'Subtitle' ),

	icon: 'text',

	category: 'common',

	attributes: {
		content: children( 'p' ),
	},

	edit( { attributes, setAttributes, focus, setFocus, className } ) {
		const { content, placeholder } = attributes;

		return [
			<Editable
				tagName="p"
				key="editable"
				value={ content }
				onChange={ ( nextContent ) => {
					setAttributes( {
						content: nextContent,
					} );
				} }
				focus={ focus }
				onFocus={ setFocus }
				className={ className }
				placeholder={ placeholder || __( 'Write subtitle…' ) }
			/>,
		];
	},

	save( { attributes, className } ) {
		const { content } = attributes;

		return <p className={ className }>{ content }</p>;
	},
} );
