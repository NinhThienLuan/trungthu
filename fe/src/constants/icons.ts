/**
 * Danh sách icon Google Material Symbols (bộ icon chính thức bản thiết kế Stitch dùng).
 * Chỉ các icon có tên ở đây mới được tải (Google Fonts `icon_names`, ~35KB).
 * Dùng icon mới: thêm tên vào danh sách (giữ thứ tự a-z). Tra tên tại https://fonts.google.com/icons
 */
export const ICON_NAMES = [
  'ac_unit', 'account_balance', 'account_balance_wallet', 'account_circle', 'add', 'add_a_photo', 'add_circle',
  'add_shopping_cart', 'add_task', 'alarm', 'analytics', 'approval', 'apps', 'arrow_back', 'arrow_drop_down',
  'arrow_forward', 'assignment', 'assignment_turned_in', 'auto_awesome', 'auto_mode', 'badge', 'bakery_dining',
  'biotech', 'block', 'bolt', 'broken_image', 'brush', 'business_center', 'calculate', 'call', 'cancel', 'car_tag',
  'card_giftcard', 'check', 'check_circle', 'chevron_left', 'chevron_right', 'close', 'cloud_download', 'cloud_sync',
  'cloud_upload', 'cooking', 'corporate_fare', 'crown', 'dashboard', 'description', 'device_thermostat', 'diamond',
  'domain', 'done', 'download', 'download_for_offline', 'draw', 'eco', 'edit_note', 'emergency_home', 'event',
  'event_available', 'expand_more', 'fact_check', 'file_download', 'flight', 'flight_takeoff', 'gavel', 'grid_view',
  'health_and_safety', 'history_edu', 'history_toggle_off', 'hourglass_top', 'hub', 'info', 'inventory_2', 'key',
  'label', 'license', 'liquor', 'local_cafe', 'local_fire_department', 'local_police', 'local_shipping',
  'location_on', 'lock', 'lock_open', 'login', 'logout', 'mail', 'mark_email_read', 'menu_book', 'military_tech',
  'navigation', 'nest_clock_farsight_analog', 'notification_important', 'notifications', 'outdoor_grill', 'oven_gen',
  'palette', 'payments', 'pending', 'pending_actions', 'percent', 'person', 'picture_as_pdf', 'pie_chart', 'policy',
  'precision_manufacturing', 'print', 'print_connect', 'progress_activity', 'qr_code_2', 'radio_button_unchecked',
  'ramen_dining', 'receipt', 'receipt_long', 'remove', 'report_problem', 'request_quote', 'restart_alt', 'rule',
  'save', 'schedule', 'schedule_send', 'search', 'search_off', 'security', 'send', 'send_time_extension', 'sensors',
  'severe_cold', 'shield', 'shopping_bag', 'shopping_cart', 'soup_kitchen', 'star', 'star_border', 'star_half',
  'stars', 'store', 'storefront', 'support_agent', 'sync', 'table_view', 'task_alt', 'thermostat', 'timer_10',
  'token', 'trending_down', 'trending_up', 'tune', 'two_wheeler', 'unfold_more', 'upload_file', 'verified',
  'verified_user', 'view_agenda', 'visibility', 'warning', 'wb_twilight', 'wine_bar', 'workspace_premium',
] as const

export const ICON_SET: ReadonlySet<string> = new Set(ICON_NAMES)

/** Chỉ tải font với các icon trong danh sách; trục biến thể rút gọn: cỡ 20..48, đậm 400, tô 0..1 */
export const ICON_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0' +
  `&icon_names=${[...ICON_NAMES].sort().join(',')}&display=block`
