<?php
/**
 * Password change with the current password checked on the server.
 *
 * POST /wp-json/sc/v1/change-password
 *   { "current_password": "...", "new_password": "..." }
 *
 * Used by the admin's "Moj profil" page. WordPress's own POST /wp/v2/users/me
 * accepts a new password without the old one, so anyone holding a user's JWT
 * could take the account over for good. This endpoint requires the current
 * password, and the filter below stops /wp/v2/users/* from setting passwords
 * for anyone who cannot edit users (administrators keep wp-admin as before).
 *
 * INSTALL: lives on the site as the snippet "Change password REST API route"
 * (scope "Run everywhere"). Code Snippets adds the opening <?php tag itself.
 */

add_action( 'rest_api_init', function () {
    register_rest_route( 'sc/v1', '/change-password', array(
        'methods'             => 'POST',
        'callback'            => 'sc_change_password',
        'permission_callback' => 'is_user_logged_in',
        'args'                => array(
            'current_password' => array( 'required' => true, 'type' => 'string' ),
            'new_password'     => array( 'required' => true, 'type' => 'string' ),
        ),
    ) );
} );

function sc_change_password( WP_REST_Request $request ) {
    $min_length = 10;
    $max_fails  = 5;

    $user     = wp_get_current_user();
    $current  = (string) $request['current_password'];
    $new      = (string) $request['new_password'];
    $throttle = 'sc_change_password_fails_' . $user->ID;
    $fails    = (int) get_transient( $throttle );

    // Wrong guesses are limited per account, so a stolen token cannot be used to
    // brute-force the current password.
    if ( $fails >= $max_fails ) {
        return new WP_Error( 'sc_too_many_attempts', 'Previše pogrešnih pokušaja. Pokušajte ponovno za 15 minuta.', array( 'status' => 429 ) );
    }

    if ( ! wp_check_password( $current, $user->user_pass, $user->ID ) ) {
        set_transient( $throttle, $fails + 1, 15 * MINUTE_IN_SECONDS );
        return new WP_Error( 'sc_incorrect_password', 'Trenutna lozinka nije točna.', array( 'status' => 403 ) );
    }

    if ( mb_strlen( $new ) < $min_length ) {
        return new WP_Error( 'sc_weak_password', sprintf( 'Nova lozinka mora imati najmanje %d znakova.', $min_length ), array( 'status' => 400 ) );
    }
    if ( $new === $current ) {
        return new WP_Error( 'sc_same_password', 'Nova lozinka mora biti različita od trenutne.', array( 'status' => 400 ) );
    }

    delete_transient( $throttle );

    // wp_update_user (not wp_set_password) so WordPress hashes the password and
    // sends its usual "password changed" notice, as a profile edit would. But it
    // also logs the browser into WordPress with cookies when users change their
    // own password, and those cookies then override the admin's JWT on every
    // later REST call. So no cookies are sent from here.
    add_filter( 'send_auth_cookies', '__return_false' );
    $result = wp_update_user( array( 'ID' => $user->ID, 'user_pass' => $new ) );
    remove_filter( 'send_auth_cookies', '__return_false' );
    if ( is_wp_error( $result ) ) {
        return new WP_Error( 'sc_password_not_saved', 'Lozinka nije spremljena.', array( 'status' => 500 ) );
    }

    // End every WordPress login session of this user (wp-admin in any browser),
    // including the one wp_update_user just created. The admin's JWT is not a
    // session and keeps working.
    WP_Session_Tokens::get_instance( $user->ID )->destroy_all();

    return array( 'message' => 'Lozinka je promijenjena.' );
}

// Only this endpoint changes passwords for non-administrators. Without this,
// POST /wp/v2/users/me { password } would still skip the current-password check.
add_filter( 'rest_pre_dispatch', function ( $result, $server, $request ) {
    if ( null !== $result
        || ! in_array( $request->get_method(), array( 'POST', 'PUT', 'PATCH' ), true )
        || ! preg_match( '#^/wp/v2/users/(me|\d+)/?$#', $request->get_route() )
        || null === $request->get_param( 'password' )
        || current_user_can( 'edit_users' ) ) {
        return $result;
    }
    return new WP_Error( 'sc_password_change_disabled', 'Lozinka se mijenja na stranici Moj profil.', array( 'status' => 403 ) );
}, 10, 3 );
