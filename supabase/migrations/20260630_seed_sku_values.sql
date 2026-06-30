-- Backfill SKU + variant fields for dummy products that were seeded
-- before the SKU column was added

UPDATE products SET
  sku = 'MGT-NS-GTRR35-SA',
  manufacturer = 'Mini GT', car_make = 'Nissan', car_model = 'GT-R R35', color = 'Silver / Advocates', color_group = 'mini-gt-nissan-gtr-r35-supercar-advocates'
WHERE id = 'fb-01';

UPDATE products SET
  sku = 'MGT-NS-GTRR32-SUN',
  manufacturer = 'Mini GT', car_make = 'Nissan', car_model = 'GT-R R32', color = 'Sunrise Orange', color_group = 'mini-gt-nissan-gtr-r32'
WHERE id = 'fb-02';

UPDATE products SET
  sku = 'MGT-POR-911GTR-PK',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3 R', color = 'Pink / Roxy Racing', color_group = 'mini-gt-porsche-911-gt3r-ao-racing-roxy'
WHERE id = 'fb-03';

UPDATE products SET
  sku = 'MGT-POR-911GRSW-GR',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3 RS Weissach', color = 'Guards Red', color_group = 'mini-gt-porsche-911-gt3rs-weissach'
WHERE id = 'fb-04';

UPDATE products SET
  sku = 'MGT-POR-911GTR-PFS',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3 R', color = 'Pink / Flying Lizard', color_group = 'mini-gt-porsche-911-gt3r-flying-lizard'
WHERE id = 'fb-05';

UPDATE products SET
  sku = 'MGT-POR-911GTR-GN',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3 R', color = 'Green / AO Racing', color_group = 'mini-gt-porsche-911-gt3r-ao-racing-roxy'
WHERE id = 'fb-06';

UPDATE products SET
  sku = 'MGT-POR-911DK-RR',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 Dakar', color = 'Rally Red', color_group = 'mini-gt-porsche-911-dakar'
WHERE id = 'fb-07';

UPDATE products SET
  sku = 'MGT-POR-911GT3-CM',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3', color = 'Chalk / Miami', color_group = 'mini-gt-porsche-911-gt3-miami'
WHERE id = 'fb-08';

UPDATE products SET
  sku = 'MGT-NS-GTRR35-BL',
  manufacturer = 'Mini GT', car_make = 'Nissan', car_model = 'GT-R R35', color = 'Blue / LB Works', color_group = 'mini-gt-nissan-gtr-r35-lb-works'
WHERE id = 'fb-09';

UPDATE products SET
  sku = 'MGT-POR-911GRSW-CB',
  manufacturer = 'Mini GT', car_make = 'Porsche', car_model = '911 GT3 RS Weissach', color = 'Chalk Blue', color_group = 'mini-gt-porsche-911-gt3rs-weissach'
WHERE id = 'fb-10';

UPDATE products SET
  sku = 'MGT-NS-ZGT500-SG24',
  manufacturer = 'Mini GT', car_make = 'Nissan', car_model = 'Z GT500', color = 'Silver / GT500 2024', color_group = 'mini-gt-nissan-z-gt500'
WHERE id = 'fb-11';

UPDATE products SET
  sku = 'WD-POR-911GTR-IMSA',
  manufacturer = NULL, car_make = 'Porsche', car_model = '911 GT3 R', color = 'White / IMSA', color_group = 'water-decal-porsche-911-gtr-imsa'
WHERE id = 'fb-12';

UPDATE products SET
  sku = 'WD-NS-GTRR35-LBW',
  manufacturer = NULL, car_make = 'Nissan', car_model = 'GT-R R35', color = 'LB Works', color_group = 'water-decal-nissan-gtr-r35-lb-works'
WHERE id = 'fb-13';

UPDATE products SET
  sku = 'ACC-STAND-ACRYL-NP',
  manufacturer = NULL, car_make = NULL, car_model = NULL, color = NULL, color_group = NULL
WHERE id = 'fb-14';
