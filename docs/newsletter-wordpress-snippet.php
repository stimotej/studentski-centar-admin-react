<?php
/**
 * WordPress Code Snippets plugin snippet for Gmail Newsletter v1.
 *
 * Before enabling:
 * 1. Replace CHANGE_ME with the same value used in the Next app as NEWSLETTER_UNSUBSCRIBE_SECRET.
 * 2. Adjust the default author ID if needed.
 */

if (!function_exists('sc_newsletter_unsubscribe_secret')) {
    function sc_newsletter_unsubscribe_secret() {
        return 'CHANGE_ME';
    }
}

if (!function_exists('sc_newsletter_unsubscribe_redirect_base_url')) {
    function sc_newsletter_unsubscribe_redirect_base_url() {
        return 'https://www.sczg.unizg.hr/teatar-td/newsletter-odjava';
    }
}

if (!function_exists('sc_newsletter_allowed_pages')) {
    function sc_newsletter_allowed_pages() {
        return array('teatar-td');
    }
}

if (!function_exists('sc_newsletter_default_author_id')) {
    function sc_newsletter_default_author_id() {
        return 189;
    }
}

if (!function_exists('sc_newsletter_admin_permission')) {
    function sc_newsletter_admin_permission() {
        return current_user_can('edit_posts');
    }
}

if (!function_exists('sc_newsletter_register_subscriber_post_type')) {
    function sc_newsletter_register_subscriber_post_type() {
        $supports = array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields');
        $labels = array(
            'name' => _x('Mailovi', 'plural'),
            'singular_name' => _x('Mail', 'singular'),
            'menu_name' => _x('Newsletter', 'admin menu'),
            'name_admin_bar' => _x('Newsletter', 'admin bar'),
            'add_new' => _x('Dodaj novi', 'add new'),
            'add_new_item' => __('Dodaj novi mail'),
            'new_item' => __('Novi mail'),
            'edit_item' => __('Uredi mail'),
            'view_item' => __('Pregledaj mail'),
            'all_items' => __('Svi mailovi'),
            'search_items' => __('Pretraži mailove'),
            'not_found' => __('Nisu pronađeni mailovi.'),
        );

        register_post_type('newsletter', array(
            'supports' => $supports,
            'taxonomies' => array('category', 'post_tag'),
            'labels' => $labels,
            'public' => true,
            'show_in_rest' => true,
            'query_var' => true,
            'rewrite' => array('slug' => 'newsletter'),
            'menu_icon' => 'dashicons-email',
            'has_archive' => true,
            'hierarchical' => false,
        ));
    }
}
add_action('init', 'sc_newsletter_register_subscriber_post_type');

if (!function_exists('sc_newsletter_register_campaign_post_type')) {
    function sc_newsletter_register_campaign_post_type() {
        register_post_type('newsletter_campaign', array(
            'supports' => array('title', 'editor', 'author'),
            'labels' => array(
                'name' => __('Newsletter kampanje'),
                'singular_name' => __('Newsletter kampanja'),
                'menu_name' => __('Newsletter kampanje'),
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'query_var' => true,
            'rewrite' => false,
            'menu_icon' => 'dashicons-email-alt',
            'has_archive' => false,
            'hierarchical' => false,
        ));
    }
}
add_action('init', 'sc_newsletter_register_campaign_post_type');

if (!function_exists('sc_newsletter_register_meta')) {
    function sc_newsletter_register_meta() {
        $subscriber_meta_keys = array(
            'email' => 'string',
            'page' => 'string',
            'first_name' => 'string',
            'last_name' => 'string',
            'unsubscribed' => 'boolean',
            'unsubscribed_at' => 'string',
        );

        foreach ($subscriber_meta_keys as $key => $type) {
            register_post_meta('newsletter', $key, array(
                'type' => $type,
                'single' => true,
                'show_in_rest' => true,
            ));
        }

        $campaign_meta_keys = array(
            'internal_name' => 'string',
            'subject' => 'string',
            'design' => 'string',
            'status' => 'string',
            'sent_at' => 'string',
            'recipient_count' => 'integer',
            'sent_count' => 'integer',
            'failed_count' => 'integer',
            'error_summary' => 'string',
        );

        foreach ($campaign_meta_keys as $key => $type) {
            register_post_meta('newsletter_campaign', $key, array(
                'type' => $type,
                'single' => true,
                'show_in_rest' => true,
            ));
        }
    }
}
add_action('init', 'sc_newsletter_register_meta');

if (!function_exists('sc_newsletter_get_meta_bool')) {
    function sc_newsletter_get_meta_bool($post_id, $key) {
        $value = get_post_meta($post_id, $key, true);
        return in_array($value, array(true, 1, '1', 'true'), true);
    }
}

if (!function_exists('sc_newsletter_normalize_subscriber')) {
    function sc_newsletter_normalize_subscriber($post) {
        return array(
            'id' => (int) $post->ID,
            'email' => (string) get_post_meta($post->ID, 'email', true),
            'firstName' => (string) get_post_meta($post->ID, 'first_name', true),
            'lastName' => (string) get_post_meta($post->ID, 'last_name', true),
            'page' => (string) get_post_meta($post->ID, 'page', true),
            'unsubscribed' => sc_newsletter_get_meta_bool($post->ID, 'unsubscribed'),
            'createdAt' => get_post_time(DATE_ATOM, true, $post),
            'unsubscribedAt' => (string) get_post_meta($post->ID, 'unsubscribed_at', true),
        );
    }
}

if (!function_exists('sc_newsletter_normalize_campaign')) {
    function sc_newsletter_normalize_campaign($post) {
        $design_json = get_post_meta($post->ID, 'design', true);

        return array(
            'id' => (int) $post->ID,
            'name' => (string) get_post_meta($post->ID, 'internal_name', true),
            'subject' => (string) get_post_meta($post->ID, 'subject', true),
            'html' => (string) $post->post_content,
            'design' => $design_json ? json_decode($design_json, true) : null,
            'status' => (string) get_post_meta($post->ID, 'status', true) ?: 'draft',
            'createdAt' => get_post_time(DATE_ATOM, true, $post),
            'sentAt' => (string) get_post_meta($post->ID, 'sent_at', true),
            'recipientCount' => (int) get_post_meta($post->ID, 'recipient_count', true),
            'sentCount' => (int) get_post_meta($post->ID, 'sent_count', true),
            'failedCount' => (int) get_post_meta($post->ID, 'failed_count', true),
            'errorSummary' => (string) get_post_meta($post->ID, 'error_summary', true),
        );
    }
}

if (!function_exists('sc_newsletter_find_subscriber')) {
    function sc_newsletter_find_subscriber($email, $page) {
        $posts = get_posts(array(
            'post_type' => 'newsletter',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'fields' => 'all',
            'meta_query' => array(
                'relation' => 'AND',
                array(
                    'key' => 'email',
                    'value' => $email,
                ),
                array(
                    'key' => 'page',
                    'value' => $page,
                ),
            ),
        ));

        return !empty($posts) ? $posts[0] : null;
    }
}

if (!function_exists('sc_newsletter_validate_page')) {
    function sc_newsletter_validate_page($page) {
        return in_array($page, sc_newsletter_allowed_pages(), true);
    }
}

if (!function_exists('sc_newsletter_update_subscriber_meta')) {
    function sc_newsletter_update_subscriber_meta($post_id, $data) {
        if (array_key_exists('email', $data)) {
            update_post_meta($post_id, 'email', sanitize_email($data['email']));
        }
        if (array_key_exists('page', $data)) {
            update_post_meta($post_id, 'page', sanitize_text_field($data['page']));
        }
        if (array_key_exists('firstName', $data)) {
            update_post_meta($post_id, 'first_name', sanitize_text_field($data['firstName']));
        }
        if (array_key_exists('lastName', $data)) {
            update_post_meta($post_id, 'last_name', sanitize_text_field($data['lastName']));
        }
        if (array_key_exists('unsubscribed', $data)) {
            $unsubscribed = !empty($data['unsubscribed']);
            update_post_meta($post_id, 'unsubscribed', $unsubscribed ? '1' : '0');
            update_post_meta($post_id, 'unsubscribed_at', $unsubscribed ? current_time('c', true) : '');
        }
    }
}

if (!function_exists('sc_newsletter_update_campaign_meta')) {
    function sc_newsletter_update_campaign_meta($post_id, $data) {
        $meta_map = array(
            'name' => 'internal_name',
            'subject' => 'subject',
            'status' => 'status',
            'sentAt' => 'sent_at',
            'recipientCount' => 'recipient_count',
            'sentCount' => 'sent_count',
            'failedCount' => 'failed_count',
            'errorSummary' => 'error_summary',
        );

        foreach ($meta_map as $input_key => $meta_key) {
            if (!array_key_exists($input_key, $data)) {
                continue;
            }

            $value = $data[$input_key];

            if (in_array($input_key, array('recipientCount', 'sentCount', 'failedCount'), true)) {
                update_post_meta($post_id, $meta_key, (int) $value);
            } else {
                update_post_meta($post_id, $meta_key, sanitize_text_field((string) $value));
            }
        }

        if (array_key_exists('design', $data)) {
            update_post_meta($post_id, 'design', $data['design'] ? wp_json_encode($data['design']) : '');
        }
    }
}

if (!function_exists('sc_newsletter_verify_unsubscribe_token')) {
    function sc_newsletter_verify_unsubscribe_token($token) {
        $parts = explode('.', (string) $token);
        if (count($parts) !== 2) {
            return new WP_Error('invalid_token', 'Invalid unsubscribe token.', array('status' => 400));
        }

        list($encoded_payload, $signature) = $parts;
        $expected_signature = rtrim(strtr(base64_encode(hash_hmac('sha256', $encoded_payload, sc_newsletter_unsubscribe_secret(), true)), '+/', '-_'), '=');

        if (!hash_equals($expected_signature, $signature)) {
            return new WP_Error('invalid_token', 'Invalid unsubscribe token.', array('status' => 400));
        }

        $normalized_payload = strtr($encoded_payload, '-_', '+/');
        $padding = strlen($normalized_payload) % 4;
        if ($padding > 0) {
            $normalized_payload .= str_repeat('=', 4 - $padding);
        }

        $payload_json = base64_decode($normalized_payload);
        $payload = json_decode($payload_json, true);

        if (empty($payload) || !is_array($payload)) {
            return new WP_Error('invalid_token', 'Invalid unsubscribe token payload.', array('status' => 400));
        }

        if (empty($payload['exp']) || (int) $payload['exp'] < time()) {
            return new WP_Error('expired_token', 'Unsubscribe token has expired.', array('status' => 400));
        }

        return $payload;
    }
}

if (!function_exists('sc_newsletter_handle_public_subscribe')) {
    function sc_newsletter_handle_public_subscribe($request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            $params = $request->get_params();
        }

        if (empty($params['email'])) {
            return new WP_Error('missing_email', 'Email is required.', array('status' => 400));
        }

        if (empty($params['page'])) {
            return new WP_Error('missing_page', 'Page is required.', array('status' => 400));
        }

        if (!is_email($params['email'])) {
            return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
        }

        $email = sanitize_email($params['email']);
        $page = sanitize_text_field($params['page']);

        if (!sc_newsletter_validate_page($page)) {
            return new WP_Error('invalid_page', 'Invalid page value.', array('status' => 400));
        }

        $existing = sc_newsletter_find_subscriber($email, $page);

        if ($existing) {
            $is_unsubscribed = sc_newsletter_get_meta_bool($existing->ID, 'unsubscribed');

            if (!$is_unsubscribed) {
                return new WP_Error('duplicate_subscription', 'Email is already subscribed.', array('status' => 409));
            }

            sc_newsletter_update_subscriber_meta($existing->ID, array(
                'email' => $email,
                'page' => $page,
                'unsubscribed' => false,
            ));

            return new WP_REST_Response(array(
                'success' => true,
                'reactivated' => true,
                'data' => sc_newsletter_normalize_subscriber(get_post($existing->ID)),
                'message' => 'Newsletter subscription reactivated.',
            ), 200);
        }

        $post_id = wp_insert_post(array(
            'post_title' => $email,
            'post_type' => 'newsletter',
            'post_status' => 'publish',
            'post_author' => sc_newsletter_default_author_id(),
        ));

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        sc_newsletter_update_subscriber_meta($post_id, array(
            'email' => $email,
            'page' => $page,
            'firstName' => '',
            'lastName' => '',
            'unsubscribed' => false,
        ));

        return new WP_REST_Response(array(
            'success' => true,
            'data' => sc_newsletter_normalize_subscriber(get_post($post_id)),
            'message' => 'Newsletter submission received.',
        ), 200);
    }
}

if (!function_exists('sc_newsletter_get_subscribers')) {
    function sc_newsletter_get_subscribers($request) {
        $page = sanitize_text_field((string) $request->get_param('page'));

        $query_args = array(
            'post_type' => 'newsletter',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'DESC',
        );

        if ($page !== '') {
            $query_args['meta_query'] = array(
                array(
                    'key' => 'page',
                    'value' => $page,
                ),
            );
        }

        $posts = get_posts($query_args);
        $items = array_map('sc_newsletter_normalize_subscriber', $posts);

        return new WP_REST_Response(array('data' => $items), 200);
    }
}

if (!function_exists('sc_newsletter_create_subscriber')) {
    function sc_newsletter_create_subscriber($request) {
        $params = $request->get_json_params();
        $email = sanitize_email((string) ($params['email'] ?? ''));
        $page = sanitize_text_field((string) ($params['page'] ?? ''));

        if (!$email || !is_email($email)) {
            return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
        }

        if (!$page || !sc_newsletter_validate_page($page)) {
            return new WP_Error('invalid_page', 'Invalid page value.', array('status' => 400));
        }

        $existing = sc_newsletter_find_subscriber($email, $page);

        if ($existing) {
            $is_unsubscribed = sc_newsletter_get_meta_bool($existing->ID, 'unsubscribed');
            if (!$is_unsubscribed) {
                return new WP_Error('duplicate_subscription', 'Email is already subscribed.', array('status' => 409));
            }

            sc_newsletter_update_subscriber_meta($existing->ID, array(
                'email' => $email,
                'page' => $page,
                'firstName' => $params['firstName'] ?? '',
                'lastName' => $params['lastName'] ?? '',
                'unsubscribed' => false,
            ));

            return new WP_REST_Response(array(
                'data' => sc_newsletter_normalize_subscriber(get_post($existing->ID)),
            ), 200);
        }

        $post_id = wp_insert_post(array(
            'post_title' => $email,
            'post_type' => 'newsletter',
            'post_status' => 'publish',
            'post_author' => get_current_user_id() ?: sc_newsletter_default_author_id(),
        ));

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        sc_newsletter_update_subscriber_meta($post_id, array(
            'email' => $email,
            'page' => $page,
            'firstName' => $params['firstName'] ?? '',
            'lastName' => $params['lastName'] ?? '',
            'unsubscribed' => false,
        ));

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_subscriber(get_post($post_id)),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_update_subscriber')) {
    function sc_newsletter_update_subscriber($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter') {
            return new WP_Error('not_found', 'Subscriber not found.', array('status' => 404));
        }

        $params = $request->get_json_params();
        sc_newsletter_update_subscriber_meta($post->ID, array(
            'firstName' => $params['firstName'] ?? '',
            'lastName' => $params['lastName'] ?? '',
            'unsubscribed' => !empty($params['unsubscribed']),
        ));

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_subscriber(get_post($post->ID)),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_delete_subscriber')) {
    function sc_newsletter_delete_subscriber($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter') {
            return new WP_Error('not_found', 'Subscriber not found.', array('status' => 404));
        }

        wp_delete_post($post->ID, true);

        return new WP_REST_Response(array(
            'data' => array('id' => (int) $request['id'], 'deleted' => true),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_get_campaigns')) {
    function sc_newsletter_get_campaigns() {
        $posts = get_posts(array(
            'post_type' => 'newsletter_campaign',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'DESC',
        ));

        $items = array_map('sc_newsletter_normalize_campaign', $posts);
        return new WP_REST_Response(array('data' => $items), 200);
    }
}

if (!function_exists('sc_newsletter_get_campaign')) {
    function sc_newsletter_get_campaign($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter_campaign') {
            return new WP_Error('not_found', 'Campaign not found.', array('status' => 404));
        }

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_campaign($post),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_create_campaign')) {
    function sc_newsletter_create_campaign($request) {
        $params = $request->get_json_params();
        $name = sanitize_text_field((string) ($params['name'] ?? ''));
        $subject = sanitize_text_field((string) ($params['subject'] ?? ''));
        $html = (string) ($params['html'] ?? '');

        $post_id = wp_insert_post(array(
            'post_title' => $name ?: ($subject ?: 'Newsletter kampanja'),
            'post_type' => 'newsletter_campaign',
            'post_status' => 'publish',
            'post_author' => get_current_user_id() ?: sc_newsletter_default_author_id(),
            'post_content' => $html,
        ));

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        sc_newsletter_update_campaign_meta($post_id, array(
            'name' => $name,
            'subject' => $subject,
            'design' => $params['design'] ?? null,
            'status' => 'draft',
            'recipientCount' => 0,
            'sentCount' => 0,
            'failedCount' => 0,
            'errorSummary' => '',
        ));

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_campaign(get_post($post_id)),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_update_campaign')) {
    function sc_newsletter_update_campaign($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter_campaign') {
            return new WP_Error('not_found', 'Campaign not found.', array('status' => 404));
        }

        $params = $request->get_json_params();
        $post_data = array(
            'ID' => $post->ID,
        );

        if (array_key_exists('name', $params)) {
            $post_data['post_title'] = sanitize_text_field((string) $params['name']) ?: $post->post_title;
        }

        if (array_key_exists('html', $params)) {
            $post_data['post_content'] = (string) $params['html'];
        }

        wp_update_post($post_data);
        sc_newsletter_update_campaign_meta($post->ID, $params);

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_campaign(get_post($post->ID)),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_delete_campaign')) {
    function sc_newsletter_delete_campaign($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter_campaign') {
            return new WP_Error('not_found', 'Campaign not found.', array('status' => 404));
        }

        wp_delete_post($post->ID, true);

        return new WP_REST_Response(array(
            'data' => array('id' => (int) $request['id'], 'deleted' => true),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_mark_campaign_sending')) {
    function sc_newsletter_mark_campaign_sending($request) {
        $post = get_post((int) $request['id']);

        if (!$post || $post->post_type !== 'newsletter_campaign') {
            return new WP_Error('not_found', 'Campaign not found.', array('status' => 404));
        }

        update_post_meta($post->ID, 'status', 'sending');

        return new WP_REST_Response(array(
            'data' => sc_newsletter_normalize_campaign(get_post($post->ID)),
        ), 200);
    }
}

if (!function_exists('sc_newsletter_public_unsubscribe')) {
    function sc_newsletter_public_unsubscribe($request) {
        $redirect_with_status = function ($status) {
            $url = add_query_arg('status', $status, sc_newsletter_unsubscribe_redirect_base_url());
            wp_safe_redirect($url);
            exit;
        };

        $token = sanitize_text_field((string) $request->get_param('token'));
        if (!$token) {
            $redirect_with_status('missing');
        }

        $payload = sc_newsletter_verify_unsubscribe_token($token);
        if (is_wp_error($payload)) {
            if ($payload->get_error_code() === 'expired_token') {
                $redirect_with_status('expired');
            }

            $redirect_with_status('invalid');
        }

        $post = get_post((int) ($payload['subscriberId'] ?? 0));
        if (!$post || $post->post_type !== 'newsletter') {
            $redirect_with_status('not-found');
        }

        $email = (string) get_post_meta($post->ID, 'email', true);
        if (!$email || strtolower($email) !== strtolower((string) ($payload['email'] ?? ''))) {
            $redirect_with_status('invalid');
        }

        sc_newsletter_update_subscriber_meta($post->ID, array(
            'unsubscribed' => true,
        ));

        $redirect_with_status('success');
    }
}

add_action('rest_api_init', function() {
    register_rest_route('wp/v2', '/newsletter/submit', array(
        'methods' => 'POST',
        'callback' => 'sc_newsletter_handle_public_subscribe',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('sc/v1', '/newsletter-subscribers', array(
        array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'sc_newsletter_get_subscribers',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
        array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'sc_newsletter_create_subscriber',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
    ));

    register_rest_route('sc/v1', '/newsletter-subscribers/(?P<id>\d+)', array(
        array(
            'methods' => 'PATCH',
            'callback' => 'sc_newsletter_update_subscriber',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
        array(
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'sc_newsletter_delete_subscriber',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
    ));

    register_rest_route('sc/v1', '/newsletter-campaigns', array(
        array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'sc_newsletter_get_campaigns',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
        array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'sc_newsletter_create_campaign',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
    ));

    register_rest_route('sc/v1', '/newsletter-campaigns/(?P<id>\d+)', array(
        array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'sc_newsletter_get_campaign',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
        array(
            'methods' => 'PATCH',
            'callback' => 'sc_newsletter_update_campaign',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
        array(
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => 'sc_newsletter_delete_campaign',
            'permission_callback' => 'sc_newsletter_admin_permission',
        ),
    ));

    register_rest_route('sc/v1', '/newsletter-campaigns/(?P<id>\d+)/send', array(
        'methods' => 'POST',
        'callback' => 'sc_newsletter_mark_campaign_sending',
        'permission_callback' => 'sc_newsletter_admin_permission',
    ));

    register_rest_route('sc/v1', '/newsletter-unsubscribe', array(
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'sc_newsletter_public_unsubscribe',
        'permission_callback' => '__return_true',
    ));
});
