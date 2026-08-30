<?php
/**
 * Event REST endpoints, with English fields exposed.
 *
 * These endpoints return a flattened shape rather than the WordPress post, so
 * registered `_en` meta never reached the frontend — the culture slider and the
 * event lists stayed Croatian no matter what the pages did.
 *
 * The only change from the original is `sc_event_en_fields()` and the four
 * `array_merge` calls that add it to each shape.
 *
 * INSTALL: replace the existing event-endpoints snippet in Code Snippets with
 * this, WITHOUT the opening <?php tag. Scope: "Run everywhere".
 *
 * VERIFY:
 *   curl -s https://www.sczg.unizg.hr/wp-json/wp/v2/events/slider | grep -o '"title_en"'
 */

/**
 * The English twins for one event. Keep in one place so the four shapes below
 * cannot drift apart.
 */
function sc_event_en_fields( $post_id ) {
	return array(
		'title_en'    => get_post_meta( $post_id, 'title_en', true ),
		'content_en'  => get_post_meta( $post_id, 'content_en', true ),
		'location_en' => get_post_meta( $post_id, 'location_en', true ),
	);
}

add_action( 'rest_api_init', 'custom_event_rest_route' );
function custom_event_rest_route() {
	register_rest_route( 'wp/v2', '/events/new', array(
		'methods' => 'GET',
		'callback' => 'get_new_events',
	) );

	register_rest_route( 'wp/v2', '/events', array(
		'methods' => 'GET',
		'callback' => 'get_all_events',
		'args' => array(
			'slug' => array(
				'type' => 'string',
				'description' => 'Filter events by slug',
				'required' => false,
			),
		),
	) );

	register_rest_route( 'wp/v2', '/events/slider', array(
		'methods' => 'GET',
		'callback' => 'get_slider_events',
	) );

	register_rest_route( 'wp/v2', '/events/courses', array(
		'methods' => 'GET',
		'callback' => 'get_courses',
	) );

	register_rest_route( 'wp/v2', '/events/active', array(
		'methods' => 'GET',
		'callback' => 'get_active_events',
		'args' => array(
			'location' => array(
				'type' => 'string',
				'description' => 'Filter events by location',
				'required' => false,
			),
		),
	) );
}

function get_active_events( $request ) {
	$today = wp_date('Y-m-d');
	$location_filter = $request->get_param( 'location' );

	$args = array(
		'numberposts' => -1,
		'post_type'   => 'event',
		'post_status' => 'publish',
	);

	$posts = get_posts($args);
	$active_posts = array();

	foreach ($posts as $post) {
		$event_dates = get_post_meta($post->ID, 'dates', true);
		$location = get_post_meta($post->ID, 'location', true);

		if ( !empty( $location_filter ) && $location !== $location_filter ) {
			continue;
		}

		if (!empty($event_dates) && is_array($event_dates)) {
			foreach ($event_dates as $date) {
				if (strtotime($date) >= strtotime($today)) {
					$active_posts[] = $post;
					break;
				}
			}
		}
	}

	return $active_posts;
}

function get_events( $number_of_events, $include_past_events ) {
	$today = wp_date( 'c' );

	$args = array (
		'numberposts' => -1,
		'post_type' => 'event',
		'meta_key' => 'dates',
		'orderby' => 'meta_value',
		'order' => 'DESC',
		'meta_query' => array(
			array(
				'key' => 'is_course',
				'value' => false,
				'compare' => '=',
			)
		)
	);
	$query = get_posts( $args );

	$events = array();

	foreach ($query as $post) {

		$event_dates = get_post_meta( $post->ID, 'dates', true );

		$location = get_post_meta( $post->ID, 'location', true );
		$dates = get_post_meta( $post->ID, 'dates', true );
		$start_showing = get_post_meta( $post->ID, 'start_showing', true );
		$end_showing = get_post_meta( $post->ID, 'end_showing', true );
		$show_always = get_post_meta( $post->ID, 'show_always', true );
		$documents = get_post_meta( $post->ID, 'documents', true );
		$type = get_post_meta( $post->ID, 'type', true );
		$show_on_slider = get_post_meta( $post->ID, 'show_on_slider', true );
		$is_course = get_post_meta( $post->ID, 'is_course', true );

		foreach ($event_dates as $date) {
			if($include_past_events || (strtotime($date) >= strtotime($today))) {
				array_push($events, array_merge(array(
					'id' => $post->ID,
					'title' => $post->post_title,
					'slug' => $post->post_name,
					'permalink' => get_permalink($post),
					'image' => get_the_post_thumbnail_url($post),
					'location' => $location,
					'dates' => $dates,
					'event_date' => $date,
					'content' => $post->post_content,
					'start_showing' => $start_showing,
					'end_showing' => $end_showing,
					'show_always' => $show_always,
					'documents' => $documents,
					'type' => $type,
					'show_on_slider' => $show_on_slider,
					'is_course' => $is_course,
				), sc_event_en_fields( $post->ID )));
			}

		}
	}

	usort($events, function($a, $b) {
		return strtotime($a["event_date"]) - strtotime($b["event_date"]) ;
	});

	$events = array_slice($events, 0, $number_of_events, true);

	return $events;
}

function get_new_events( $request ) {

	$events = get_events(10, false);

	return $events;

}

function get_all_events( $request ) {

	$slug = $request->get_param( 'slug' );

	if ( !empty( $slug ) ) {
		$args = array(
			'name'        => $slug,
			'post_type'   => 'event',
			'post_status' => 'publish',
			'numberposts' => 1
		);
		$posts = get_posts($args);
		$post = $posts[0];

		if ( empty( $post ) ) {
			return new WP_Error( 'event_not_found', __( 'Event not found' ), array( 'status' => 404 ) );
		}

		$dates = get_post_meta( $post->ID, 'dates', true );
		$location = get_post_meta( $post->ID, 'location', true );
		$start_showing = get_post_meta( $post->ID, 'start_showing', true );
		$end_showing = get_post_meta( $post->ID, 'end_showing', true );
		$show_always = get_post_meta( $post->ID, 'show_always', true );
		$documents = get_post_meta( $post->ID, 'documents', true );
		$type = get_post_meta( $post->ID, 'type', true );
		$show_on_slider = get_post_meta( $post->ID, 'show_on_slider', true );
		$is_course = get_post_meta( $post->ID, 'is_course', true );

		$event = array_merge(array(
			'id' => $post->ID,
			'title' => $post->post_title,
			'slug' => $post->post_name,
			'permalink' => get_permalink($post),
			'image' => get_the_post_thumbnail_url($post),
			'location' => $location,
			'dates' => $dates,
			'event_date' => "",
			'content' => $post->post_content,
			'start_showing' => $start_showing,
			'end_showing' => $end_showing,
			'show_always' => $show_always,
			'documents' => $documents,
			'type' => $type,
			'show_on_slider' => $show_on_slider,
			'is_course' => $is_course,
		), sc_event_en_fields( $post->ID ));

		return $event;
	}

	$events = get_events(50, false);

	return $events;
}

function get_slider_events() {
	$args = array (
		'numberposts' => 10,
		'post_type' => 'event',
		'meta_query' => array(
			array(
				'key' => 'show_on_slider',
				'value' => true,
				'compare' => '=',
			)
		)
	);
	$query = get_posts( $args );

	$events = array();

	foreach ($query as $post) {

		$event_dates = get_post_meta( $post->ID, 'dates', true );

		$location = get_post_meta( $post->ID, 'location', true );
		$dates = get_post_meta( $post->ID, 'dates', true );
		$start_showing = get_post_meta( $post->ID, 'start_showing', true );
		$end_showing = get_post_meta( $post->ID, 'end_showing', true );
		$show_always = get_post_meta( $post->ID, 'show_always', true );
		$documents = get_post_meta( $post->ID, 'documents', true );
		$type = get_post_meta( $post->ID, 'type', true );
		$show_on_slider = get_post_meta( $post->ID, 'show_on_slider', true );
		$is_course = get_post_meta( $post->ID, 'is_course', true );

		array_push($events, array_merge(array(
			'id' => $post->ID,
			'title' => $post->post_title,
			'slug' => $post->post_name,
			'permalink' => get_permalink($post),
			'image' => get_the_post_thumbnail_url($post),
			'location' => $location,
			'dates' => $dates,
			'event_date' => '',
			'content' => $post->post_content,
			'start_showing' => $start_showing,
			'end_showing' => $end_showing,
			'show_always' => $show_always,
			'documents' => $documents,
			'type' => $type,
			'show_on_slider' => $show_on_slider,
			'is_course' => $is_course,
		), sc_event_en_fields( $post->ID )));
	}

	return $events;
}

function get_courses() {
	$args = array (
		'numberposts' => -1,
		'post_type' => 'event',
		'meta_key' => 'dates',
		'orderby' => 'meta_value',
		'order' => 'DESC',
		'meta_query' => array(
			array(
				'key' => 'is_course',
				'value' => true,
				'compare' => '=',
			)
		)
	);
	$query = get_posts( $args );

	$events = array();

	foreach ($query as $post) {

		$event_dates = get_post_meta( $post->ID, 'dates', true );

		$location = get_post_meta( $post->ID, 'location', true );
		$dates = get_post_meta( $post->ID, 'dates', true );
		$start_showing = get_post_meta( $post->ID, 'start_showing', true );
		$end_showing = get_post_meta( $post->ID, 'end_showing', true );
		$show_always = get_post_meta( $post->ID, 'show_always', true );
		$documents = get_post_meta( $post->ID, 'documents', true );
		$type = get_post_meta( $post->ID, 'type', true );
		$show_on_slider = get_post_meta( $post->ID, 'show_on_slider', true );
		$is_course = get_post_meta( $post->ID, 'is_course', true );

		foreach ($event_dates as $date) {
			array_push($events, array_merge(array(
				'id' => $post->ID,
				'title' => $post->post_title,
				'slug' => $post->post_name,
				'permalink' => get_permalink($post),
				'image' => get_the_post_thumbnail_url($post),
				'location' => $location,
				'dates' => $dates,
				'event_date' => $date,
				'content' => $post->post_content,
				'start_showing' => $start_showing,
				'end_showing' => $end_showing,
				'show_always' => $show_always,
				'documents' => $documents,
				'type' => $type,
				'show_on_slider' => $show_on_slider,
				'is_course' => $is_course,
			), sc_event_en_fields( $post->ID )));
		}
	}

	usort($events, function($a, $b) {
		return strtotime($a["event_date"]) - strtotime($b["event_date"]);
	});

	// NOTE: $number_of_events is undefined in this function — it is not a
	// parameter and never assigned. On PHP 8 this raises a warning and
	// array_slice receives null, which returns everything from offset 0.
	// Left as-is so this change stays a pure addition; worth fixing separately.
	$events = array_slice($events, 0, $number_of_events, true);

	return $events;
}
