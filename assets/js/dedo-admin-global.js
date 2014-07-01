jQuery( document ).ready( function( $ ) {

	/**
	 * General
	 *
	 * General JS for admin area.
	 *
	 * @since  1.4
	 */
	var DEDO_Admin = {

		init: function() {
			
			this.confirmAction();
		},

		confirmAction: function() {
			
			var $confirmAction = $( '.dedo_confirm_action' );

			$confirmAction.on( 'click', function( e ) {

				if ( !confirm( $confirmAction.data( 'confirm' ) ) ) {
					e.preventDefault();
				}

			} );
		}
	};

	DEDO_Admin.init();

	/**
	 * Modal
	 *
	 * Handle modals.
	 *
	 * @since  1.5
	 */
	var DEDO_Modal = {

		// Store current modal
		modal: null,

		init: function() {
			
			this.listenerModal();
		},

		listenerModal: function() {

			self = this;

			// Show modal
			$( '.dedo-modal-action' ).on( 'click', function( e ) {

				self.modal = $( this ).attr( 'href' );

				self.showModal();
				e.preventDefault();
			} );

			// Close modal
			$( 'body' ).on( 'click', '.dedo-modal-close, #dedo-modal-background', function( e ) {

				self.closeModal();
				e.preventDefault();
			} );
		},

		showModal: function( modal ) {

			// Add background
			$( 'body' ).append( $( '<div id="dedo-modal-background" style="display: none">Test</div>' ).fadeTo( 300, .7 ) );

			// Display modal
			$( this.modal ).fadeIn( 300 );			
		},

		closeModal: function() {

			// Fade and remove background
			$( '#dedo-modal-background' ).fadeOut( 300, function() {

				this.remove();
			} );

			// Hide modal window
			$( this.modal ).fadeOut( 300 );
		}
	};

	DEDO_Modal.init();

	/**
	 * Dashboard
	 *
	 * Updates dashboard widget.
	 *
	 * @since  1.4
	 */
	var DEDO_Dashboard = {

		// Store options from serialized WP array
		options: {},

		// Cache DOM objects
		$popularDownloadsDropdown: $( '#popular-downloads-dropdown' ),
		$popularDownloadsSpinner: $( '#ddownload-popular .spinner' ),
		$popularDownloadsError: $( '#ddownload-popular .error' ),

		init: function( options ) {
			
			this.options = options;
			this.countDownloadsGet();
			this.popularDownloadsChange();
		},

		// Get download counts
		countDownloadsGet: function() {

			var self = this;

			// Send ajax request
			$.ajax( {
				url: self.options.ajaxURL,
				data: {
					action: 'dedo_count_downloads',
					nonce: self.options.nonce,
				},
				dataType: 'json',
				success: function( response ) {
					self.countDownloadsSuccess( response );
				},
				error: function() {
					self.downloadsError();
				}
			} );
		},

		countDownloadsSuccess: function( response ) {

			// Request successful
			if ( 'success' === response.status ) {

				$.each( response.content, function( key, value) {
					// Update display
					$( '#' + key + ' .count' ).text( value );
				} );

				// Fade in counts list
				$( '#ddownload-count li' ).fadeTo( 600, 1 );
				
			}
			// Request returned error
			else {
				this.downloadsError();
			}
		},

		// Add event handler to popular downloads dropdown
		popularDownloadsChange: function() {
			
			this.$popularDownloadsDropdown.on( 'change', function() {
				DEDO_Dashboard.popularDownloadsGet( $( this ).val() );
			} );
		},

		// Send query to WP, retrieving top 5 downloads
		popularDownloadsGet: function( value ) {
			
			var self = this;

			// Show loading
			this.$popularDownloadsSpinner.css( 'display', 'inline-block' );

			// Send ajax request
			$.ajax( {
				url: self.options.ajaxURL,
				data: {
					action: 'dedo_popular_downloads',
					nonce: self.options.nonce,
					days: value
				},
				dataType: 'json',
				success: function( response ) {
					self.popularDownloadsSuccess( response );
				},
				error: function() {
					self.downloadsError();
				}
			} );

		},

		// Update popular downloads on screen
		popularDownloadsSuccess: function( response ) {

			// Hide error 
			this.$popularDownloadsError.fadeOut( 300 );

			// Hide loading
			this.$popularDownloadsSpinner.css( 'display', 'none' );

			// Request successful
			if ( 'success' === response.status ) {
				
				var output;

				// Results returned
				if ( response.content.length > 0 ) {

					output = '<ol id="popular-downloads" style="display: none;">';

					// Success, build list
					$.each( response.content, function( key, value) {
					
						output += '<li>';
						output += '<a href="' + value.url + '">' + value.title + ' <span class="count">' + value.downloads + '</span></a>';
						output += '</li>';
					} );

					output += '</ol>';

				}
				else {

					output = '<p id="popular-downloads" style="display: none;">' + this.options.noResultsText + '</p>';
				}

				// Slide out and remove old list
				$( '#popular-downloads' ).slideUp( 300, function() {
					$( this ).remove();
					
					// Insert new list and fade in
					$( output ).insertAfter( '#ddownload-popular h4' );
					$( '#popular-downloads' ).slideDown( 300 );
				});
				
			}
			// Request returned error
			else {
				this.downloadsError();
			}
		},

		// Show error message
		downloadsError: function() {

			// Show error
			this.$popularDownloadsError.text( this.options.errorText ).fadeIn( 300 );
		}
	};
	
	// Init Dashboard if serialized WP array available
	if ( 'undefined' !== typeof DEDODashboardOptions ) {
		DEDO_Dashboard.init( DEDODashboardOptions );
	}

	/**
	 * Settings
	 *
	 * Settings tabs.
	 *
	 * @since  1.5
	 */
	var DEDO_Settings = {

		init: function() {
			this.settingsTabs();
		},

		settingsTabs: function() {
			
			// Hide non active tabs
			$( '#dedo-settings-main .dedo-settings-tab:not(.active)' ).hide();

			// Show tabs on click
			$( '#dedo-settings-tabs a' ).on( 'click', function( e ) {

				var $cachedTab = $( this );

				// Update tab state
				$( $cachedTab ).addClass( 'nav-tab-active' ).siblings( '.nav-tab' ).removeClass( 'nav-tab-active' );

				// Show/hide form section
				$( $cachedTab.attr( 'href' ) ).siblings( '.dedo-settings-tab:visible' ).hide( 0, function() {

					$( $cachedTab.attr( 'href' ) ).show();
				} );

				e.preventDefault();
			} );
		}
	};

	DEDO_Settings.init();

} );