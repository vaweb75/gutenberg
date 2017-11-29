/**
 * External dependencies
 */
import { isEmpty, reduce, isObject, castArray, compact, startsWith, random } from 'lodash';
import { html as beautifyHtml } from 'js-beautify';

/**
 * WordPress dependencies
 */
import { Component, createElement, renderToString, cloneElement, Children } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getBlockType, getUnknownTypeHandlerName } from './registration';
import { applyFilters } from '../hooks';

/**
 * Returns the block's name with common prefixes: 'core/' or 'core-' (in 'core-embed/') dropped
 *
 * @param {String}   blockName  The block name
 * @return {string}             Friendly name
 */
function friendlyBlockName( blockName ) {
	return blockName.replace( /\//, '-' ).replace( /^core-/, '' );
}

/**
 * Returns the block's default classname from its name
 *
 * @param {String}   blockName  The block name
 * @return {string}             The block's default class
 */
export function getBlockDefaultClassname( blockName ) {
	return `wp-block-${ friendlyBlockName( blockName ) }`;
}

/**
 * Returns a random base 36 string, 36^7 possible strings, maximum seven chars
 * According to the birthday paradox repetition occur after sqrt(36^7) = 279936 random strings are generated
 * If used to generate ids it's relatively safe as the odds of having 279936 blocks of the same type on a page are really low
 *
 * @return {string}             Random string
 */
function randomBase36String() {
	return random( 0, Math.pow( 36, 7 ), false ).toString( 36 );
}

/**
 * Returns random anchor for the block
 *
 * @param {String}   blockName  The block name
 * @return {string}             The block's default class
 */
export function getBlockRandomAnchor( blockName ) {
	return `wp-block-${ friendlyBlockName( blockName ) }-${ randomBase36String() }`;
}

/**
 * Given a block type containg a save render implementation and attributes, returns the
 * static markup to be saved.
 *
 * @param  {Object} blockType  Block type
 * @param  {Object} attributes Block attributes
 * @return {string}            Save content
 */
export function getSaveContent( blockType, attributes ) {
	const { save } = blockType;
	let saveContent;

	if ( save.prototype instanceof Component ) {
		saveContent = createElement( save, { attributes } );
	} else {
		saveContent = save( { attributes } );

		// Special-case function render implementation to allow raw HTML return
		if ( 'string' === typeof saveContent ) {
			return saveContent;
		}
	}

	const addExtraContainerProps = ( element ) => {
		if ( ! element || ! isObject( element ) ) {
			return element;
		}

		// Applying the filters adding extra props
		const props = applyFilters( 'getSaveContent.extraProps', { ...element.props }, blockType, attributes );

		return cloneElement( element, props );
	};
	const contentWithExtraProps = Children.map( saveContent, addExtraContainerProps );

	// Otherwise, infer as element
	return renderToString( contentWithExtraProps );
}

/**
 * Returns attributes which are to be saved and serialized into the block
 * comment delimiter.
 *
 * When a block exists in memory it contains as its attributes both those
 * parsed the block comment delimiter _and_ those which matched from the
 * contents of the block.
 *
 * This function returns only those attributes which are needed to persist and
 * which cannot be matched from the block content.
 *
 * @param   {Object<String,*>} allAttributes Attributes from in-memory block data
 * @param   {Object<String,*>} blockType     Block type
 * @returns {Object<String,*>}               Subset of attributes for comment serialization
 */
export function getCommentAttributes( allAttributes, blockType ) {
	const attributes = reduce( blockType.attributes, ( result, attributeSchema, key ) => {
		const value = allAttributes[ key ];

		// Ignore undefined values
		if ( undefined === value ) {
			return result;
		}

		// Ignore all attributes but the ones with an "undefined" source
		// "undefined" source refers to attributes saved in the block comment
		if ( attributeSchema.source !== undefined ) {
			return result;
		}

		// Ignore default value
		if ( 'default' in attributeSchema && attributeSchema.default === value ) {
			return result;
		}

		// Otherwise, include in comment set
		result[ key ] = value;
		return result;
	}, {} );

	return attributes;
}

export function serializeAttributes( attrs ) {
	return JSON.stringify( attrs )
		.replace( /--/g, '\\u002d\\u002d' ) // don't break HTML comments
		.replace( /</g, '\\u003c' ) // don't break standard-non-compliant tools
		.replace( />/g, '\\u003e' ) // ibid
		.replace( /&/g, '\\u0026' ); // ibid
}

/**
 * Returns HTML markup processed by a markup beautifier configured for use in
 * block serialization.
 *
 * @param  {String} content Original HTML
 * @return {String}         Beautiful HTML
 */
export function getBeautifulContent( content ) {
	return beautifyHtml( content, {
		indent_inner_html: true,
		wrap_line_length: 0,
	} );
}

/**
 * Given a block object, returns the Block's Inner HTML markup
 * @param  {Object} block Block Object
 * @return {String}       HTML
 */
export function getBlockContent( block ) {
	const blockType = getBlockType( block.name );

	// If block was parsed as invalid or encounters an error while generating
	// save content, use original content instead to avoid content loss.
	let saveContent = block.originalContent;
	if ( block.isValid ) {
		try {
			saveContent = getSaveContent( blockType, block.attributes );
		} catch ( error ) {}
	}

	return getUnknownTypeHandlerName() === block.name || ! saveContent ? saveContent : getBeautifulContent( saveContent );
}

/**
 * Returns the content of a block, including comment delimiters.
 *
 * @param  {String} rawBlockName  Block name
 * @param  {Object} attributes    Block attributes
 * @param  {String} content       Block save content
 * @return {String}               Comment-delimited block content
 */
export function getCommentDelimitedContent( rawBlockName, attributes, content ) {
	const serializedAttributes = ! isEmpty( attributes ) ?
		serializeAttributes( attributes ) + ' ' :
		'';

	// strip core blocks of their namespace prefix
	const blockName = startsWith( rawBlockName, 'core/' ) ?
		rawBlockName.slice( 5 ) :
		rawBlockName;

	if ( ! content ) {
		return `<!-- wp:${ blockName } ${ serializedAttributes }/-->`;
	}

	return (
		`<!-- wp:${ blockName } ${ serializedAttributes }-->\n` +
		content +
		`\n<!-- /wp:${ blockName } -->`
	);
}

/**
 * Returns the content of a block, including comment delimiters, determining
 * serialized attributes and content form from the current state of the block.
 *
 * @param  {Object} block Block instance
 * @return {String}       Serialized block
 */
export function serializeBlock( block ) {
	const blockName = block.name;
	const blockType = getBlockType( blockName );
	const saveContent = getBlockContent( block );
	const saveAttributes = getCommentAttributes( block.attributes, blockType );

	switch ( blockName ) {
		case 'core/more':
			const { customText, noTeaser } = saveAttributes;

			const moreTag = customText ?
				`<!--more ${ customText }-->` :
				'<!--more-->';

			const noTeaserTag = noTeaser ?
				'<!--noteaser-->' :
				'';

			return compact( [ moreTag, noTeaserTag ] ).join( '\n' );

		case getUnknownTypeHandlerName():
			return saveContent;

		default:
			return getCommentDelimitedContent( blockName, saveAttributes, saveContent );
	}
}

/**
 * Takes a block or set of blocks and returns the serialized post content.
 *
 * @param  {Array}  blocks Block(s) to serialize
 * @return {String}        The post content
 */
export default function serialize( blocks ) {
	return castArray( blocks ).map( serializeBlock ).join( '\n\n' );
}
