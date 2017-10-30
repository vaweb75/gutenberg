
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

function SingleAuthor( { avatar, bio, name } ) {
	return (
		<section className="blocks-single-author">
			{ name && <h2> { name }</h2> }
			{ ( avatar || bio ) && (
				<p>
					{ avatar && <img src={ avatar } alt={ __( 'avatar' ) } /> }
					{ bio }
				</p>
			) }
		</section>
	);
}

export default SingleAuthor;
