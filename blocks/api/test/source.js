/**
 * External dependencies
 */
import { parse } from 'hpq';

/**
 * WordPress dependencies
 */
import { renderToString } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { createHTMLFromSimpleNodeList } from '../../api/simple-dom';
import * as sources from '../source';

describe( 'sources', () => {
	const html = '<blockquote><p>A delicious <b>sundae</b> dessert.</p><p>I want it!</p><footer>The Cook</footer></blockquote>';

	it( 'should generate sources which apply internal flag', () => {
		for ( const sourceFn in sources ) {
			expect( sources[ sourceFn ]()._wpBlocksKnownSource ).toBe( true );
		}
	} );

	describe( 'children()', () => {
		it( 'should return a source function', () => {
			const source = sources.children();

			expect( typeof source ).toBe( 'function' );
		} );

		it( 'should return HTML equivalent WPElement of matched element', () => {
			// Assumption here is that we can cleanly convert back and forth
			// between a string and WPElement representation
			const match = parse( html, sources.children() );

			expect( createHTMLFromSimpleNodeList( match ) ).toBe( html );
		} );
	} );

	describe( 'node()', () => {
		it( 'should return a source function', () => {
			const source = sources.node();

			expect( typeof source ).toBe( 'function' );
		} );

		it( 'should return HTML equivalent WPElement of matched element', () => {
			// Assumption here is that we can cleanly convert back and forth
			// between a string and WPElement representation
			const match = parse( html, sources.node() );

			expect(
				createHTMLFromSimpleNodeList( [ match ] )
			).toBe(
				`<body>${ html }</body>`
			);
		} );
	} );

	describe( 'query', () => {
		it( 'should return HTML equivalent WPElement of matched element using selector', () => {
			// Assumption here is that we can cleanly convert back and forth
			// between a string and WPElement representation
			const match = parse( html, sources.query( 'blockquote > p', sources.node( ) ) );

			expect(
				createHTMLFromSimpleNodeList( match )
			).toBe(
				'<p>A delicious <b>sundae</b> dessert.</p><p>I want it!</p>'
			);
		} );
	} );
} );
