<?php
/**
 * "Zaboravljena lozinka?" on the /zaposlenici login pages.
 *
 * POST /wp-json/wp/v2/reset-password
 *   { "user_login": "<email or username>", "from": "<admin section, optional>" }
 *
 * Emails a link to WordPress's own set-password form (wp-login.php?action=rp).
 * After the new password is saved there, the user is sent back to the login
 * page of the admin section they started from, instead of the WordPress login.
 *
 * INSTALL: replaces the code of snippet 128 "User reset password REST API
 * route" (scope "Run everywhere"). Code Snippets adds the opening <?php tag.
 */

function my_custom_api_reset_password() {
    register_rest_route( 'wp/v2', '/reset-password/', array(
        'methods'  => 'POST',
        'callback' => 'my_custom_api_reset_password_callback',
        // Public on purpose: this is the "forgot password" form.
        'permission_callback' => '__return_true',
        'args'     => array(
            'user_login' => array(
                'required'    => true,
                'type'        => 'string',
                'description' => 'The user email address or username.',
            ),
            'from' => array(
                'required'    => false,
                'type'        => 'string',
                'description' => 'Admin section the request came from, e.g. turizam.',
            ),
        ),
    ) );
}
add_action( 'rest_api_init', 'my_custom_api_reset_password' );

/** Admin sections with a login page at /zaposlenici/<section>/login. */
function sc_admin_sections() {
    return array( 'obavijesti', 'prehrana', 'kultura', 'student-servis', 'smjestaj', 'sport',
                  'pocetna-stranica', 'turizam', 'eventi', 'catering', 'teatar-td' );
}

function my_custom_api_reset_password_callback( $data ) {
    // The same answer whether or not the account exists, so the form can't be
    // used to find accounts or to read their e-mail addresses.
    $response = new WP_REST_Response( array(
        'message' => 'Ako račun postoji, poruka za resetiranje lozinke poslana je na njegovu e-mail adresu.',
    ), 200 );

    $user_login = trim( (string) $data['user_login'] );

    $user_data = get_user_by( 'email', $user_login );
    if ( ! $user_data ) {
        $user_data = get_user_by( 'login', $user_login );
    }
    if ( ! $user_data ) {
        return $response;
    }

    // At most one e-mail per account every 15 minutes, so the form can't flood an inbox.
    $throttle = 'sc_reset_password_' . $user_data->ID;
    if ( get_transient( $throttle ) ) {
        return $response;
    }
    set_transient( $throttle, 1, 15 * MINUTE_IN_SECONDS );

    $key = get_password_reset_key( $user_data );
    if ( is_wp_error( $key ) ) {
        return $response;
    }

    // Remember where the request came from for as long as the link is valid,
    // so the user lands back on that section's login after the reset.
    $from = (string) $data['from'];
    set_transient( 'sc_reset_from_admin_' . $user_data->ID,
        in_array( $from, sc_admin_sections(), true ) ? $from : 'zaposlenici', DAY_IN_SECONDS );

    $url = network_site_url( 'wp-login.php?action=rp&key=' . $key . '&login=' . rawurlencode( $user_data->user_login ), 'login' );

    wp_mail(
        $user_data->user_email,
        '[Studentski Centar Zagreb] Postavljanje nove lozinke',
        sc_reset_password_email_html( $user_data->user_login, $url ),
        array( 'Content-Type: text/html; charset=UTF-8' )
    );

    return $response;
}

function sc_reset_password_email_html( $login, $url ) {
    $url   = esc_url( $url );
    $login = esc_html( $login );
    $p     = 'margin:0 0 16px;';

    return '<!doctype html><html lang="hr"><body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:8px;">'
        . '<tr><td style="padding:32px;font-size:15px;line-height:1.6;">'
        . '<p style="' . $p . 'font-size:18px;font-weight:bold;">Postavljanje nove lozinke</p>'
        . '<p style="' . $p . '">Zaprimili smo zahtjev za postavljanje nove lozinke za korisnički račun <strong>' . $login . '</strong> u sučelju za uređivanje stranica Studentskog centra u Zagrebu.</p>'
        . '<p style="margin:24px 0;"><a href="' . $url . '" style="display:inline-block;background:#2b76df;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;">Postavi novu lozinku</a></p>'
        . '<p style="' . $p . '">Poveznica vrijedi 24 sata i može se iskoristiti samo jednom. Ako gumb ne radi, kopirajte ovu adresu u preglednik:<br>'
        . '<a href="' . $url . '" style="color:#2b76df;word-break:break-all;">' . $url . '</a></p>'
        . '<p style="margin:0;">Ako niste zatražili novu lozinku, zanemarite ovu poruku. Vaša lozinka ostaje nepromijenjena.</p>'
        . '</td></tr></table>'
        . '<p style="margin:16px 0 0;font-size:12px;color:#6b7280;">Studentski centar u Zagrebu</p>'
        . '</td></tr></table></body></html>';
}

// After the new password is saved on wp-login.php, go back to the admin login
// the request came from. Resets started anywhere else are left untouched.
add_action( 'after_password_reset', function ( $user ) {
    $from = get_transient( 'sc_reset_from_admin_' . $user->ID );
    if ( ! $from ) {
        return;
    }
    delete_transient( 'sc_reset_from_admin_' . $user->ID );
    $path = in_array( $from, sc_admin_sections(), true ) ? '/zaposlenici/' . $from . '/login' : '/zaposlenici';
    wp_safe_redirect( home_url( $path . '?lozinka=promijenjena' ) );
    exit;
} );
