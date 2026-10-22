SELECT
    i.id AS order_item_id,
    o.id AS order_id,
    o.order_code,
    o.provider_id,
    b.id AS order_batch_id,
    b.delivery_date,
    DATEADD(DAY, -1, b.delivery_date) AS bake_date,
    i.variant_id,
    i.product_name,
    i.variant_name,
    i.quantity,
    i.bake_quantity,
    o.order_status
FROM ORDER_ITEM i
JOIN ORDER_BATCH b ON b.id = i.order_batch_id
JOIN "ORDER" o ON o.id = b.order_id
WHERE o.order_status IN ('CONFIRMED', 'DEPOSITED', 'BAKING_QUEUED', 'DELIVERING', 'COMPLETED')
  AND i.bake_quantity > 0
