/**
* External Dependencies
*/
import { connect } from 'react-redux';
import { flowRight } from 'lodash';

/**
 * WordPress depensdencies
 */
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PanelBody, withAPIData, Placeholder, Spinner } from '@wordpress/components';

/**
* Internal dependencies
*/
import InspectorControls from '../../inspector-controls';
import ToggleControl from '../../inspector-controls/toggle-control';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import BlockDescription from '../../block-description';
import SingleAuthor from '../../single-author';
import {
	getCurrentPostAuthor,
} from '../../../editor/selectors';

class AuthorBlock extends Component {
	constructor() {
		super( ...arguments );
		this.toggleHideBio = this.toggleHideBio.bind( this );
		this.toggleHideAvatar = this.toggleHideAvatar.bind( this );
		this.toggleHideName = this.toggleHideName.bind( this );
	}
	toggleHideBio() {
		const { attributes, setAttributes } = this.props;
		setAttributes( { hideBio: ! attributes.hideBio } );
	}

	toggleHideAvatar() {
		const { attributes, setAttributes } = this.props;
		setAttributes( { hideAvatar: ! attributes.hideAvatar } );
	}

	toggleHideName() {
		const { attributes, setAttributes } = this.props;
		setAttributes( { hideName: ! attributes.hideName } );
	}

	render() {
		const { focus, attributes, setAttributes, author } = this.props;
		const { align, hideBio, hideAvatar, hideName } = attributes;
		return [
			author.isLoading && (
				<Placeholder key="placeholder"
					icon="admin-post"
					label={ __( 'Author' ) }
				>
					<Spinner />
				</Placeholder>
			),
			author.data && (
				<SingleAuthor key="content"
					avatar={ hideAvatar ? null : author.data.avatar_urls[ '96' ] }
					bio={ hideBio ? null : author.data.description }
					name={ hideName ? null : author.data.name }
				/>
			),
			focus && (
				<InspectorControls key="inspector">
					<BlockDescription>
						<p>{ __( 'Shows the post author' ) }</p>
					</BlockDescription>
					<PanelBody title={ __( 'Alignment' ) }>
						<BlockAlignmentToolbar
							value={ align }
							onChange={ ( nextAlign ) => setAttributes( { align: nextAlign } ) }
						/>
					</PanelBody>
					<ToggleControl
						label={ __( 'Hide bio' ) }
						checked={ hideBio }
						onChange={ this.toggleHideBio }
					/>
					<ToggleControl
						label={ __( 'Hide avatar' ) }
						checked={ hideAvatar }
						onChange={ this.toggleHideAvatar }
					/>
					<ToggleControl
						label={ __( 'Hide name' ) }
						checked={ hideName }
						onChange={ this.toggleHideName }
					/>
				</InspectorControls>
			),
		];
	}
}

const applyWithAPIData = withAPIData( ( props ) => ( {
	author: `/wp/v2/users/${ props.postAuthorId }`,
} ) );

const applyConnect = connect(
	( state ) => ( {
		postAuthorId: getCurrentPostAuthor( state ),
	} )
);

export default flowRight( [
	applyConnect,
	applyWithAPIData,
] )( AuthorBlock );
