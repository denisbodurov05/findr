INSERT INTO store (id, name, description, address)
SELECT 2, 'express_store', 'express_store_description', 'express_store_address'
WHERE NOT EXISTS (
  SELECT 1 FROM store WHERE id = 2
);

INSERT INTO item_coordinate (id, x, y, store_id, product_id, checkout_id, traffic_flow_id)
SELECT nextval('coordinate_sequence'), x, y, 2, product_id, checkout_id, traffic_flow_id
FROM item_coordinate
WHERE store_id = 1
  AND EXISTS (SELECT 1 FROM store WHERE id = 2)
  AND NOT EXISTS (SELECT 1 FROM item_coordinate WHERE store_id = 2);

SELECT setval('store_sequence', (SELECT COALESCE(MAX(id), 1) FROM store), true);
SELECT setval('coordinate_sequence', (SELECT COALESCE(MAX(id), 1) FROM item_coordinate), true);
