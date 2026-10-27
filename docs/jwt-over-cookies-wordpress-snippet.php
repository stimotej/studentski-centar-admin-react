<?php
/**
 * REST requests that carry a JWT are authenticated by that token alone.
 *
 * The /zaposlenici admin sends "Authorization: Bearer <jwt>" on every call. If
 * the same browser also holds WordPress login cookies (logged into wp-admin, or
 * any flow that logs the user in), WordPress picks the cookie user first, the
 * JWT plugin then skips the token, and core demands a REST nonce the admin never
 * sends, so every call runs as logged out (401 rest_not_logged_in, 400
 * rest_forbidden_status) until the cookies are gone.
 *
 * With a Bearer header present, WordPress's cookie login is switched off for
 * that request. This only removes a way to authenticate, so it cannot be used
 * to gain access cross-site; a bad token still fails in the JWT plugin.
 *
 * INSTALL: lives on the site as the snippet "REST: JWT takes precedence over
 * login cookies" (scope "Run everywhere"). Code Snippets adds the <?php tag.
 */

$sc_auth_header = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? $_SERVER['HTTP_AUTHORIZATION']
    : ( isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '' );

if ( 0 === stripos( (string) $sc_auth_header, 'Bearer ' ) ) {
    remove_filter( 'determine_current_user', 'wp_validate_auth_cookie' );
    remove_filter( 'determine_current_user', 'wp_validate_logged_in_cookie', 20 );
}
unset( $sc_auth_header );
