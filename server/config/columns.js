/**
 * TABLE_COLUMNS_MAP
 * Maps each production table to its ordered column list (excluding `id`).
 */
const TABLE_COLUMNS_MAP = {
  dryer_tower_1: [
    'Stamp', 'Tanggal', 'Waktu', 'Nama', 'Shift', 'Team', 'Batch', 'Mode', 'Final Tank',
    'Level Final Tank', 'Temperatur Final Tank (level < 20% FT temperatur tdk valid)', 'TS Final Tank',
    'Level Feed System Tank (H1B1K01)', 'Feed Pressure (H1B1K03)', 'Speed Feed Pump (H1B1K03)',
    'Nozzle Pressure - PV (H1B1K60)', 'Speed HPP - CV (H1B1K60)', 'Feed Extract Mass Flow (H1B1P20)',
    'Factor Gas', 'Adjustable Valve CO2 (H1B1Q31)', 'Flow Meter CO2 (H1B1K30)', 'Temp Feed Inlet (H1B1K50)',
    'Pressure Supply Steam Main Air (H1P1P21)', 'Temp Main Air (H1E1K01)', 'Flow Main Air (H1E1K08)$',
    'Temp SFB Inlet (H1E1K06)', 'Flow SFB Inlet (H1E1K05)', 'Temp VF1 inlet (H1G1K02)',
    'Flow VF1 Inlet (H1G1K01)', 'Flow VF2 Inlet (H1G1K04)', 'Temp VF2 Inlet (H1G1K03)',
    'Temp VF (H1G1P07)', 'Δ Pressure Chamber : SFB (H1E1K04)', 'Temp SFB (H1E1P05)',
    '(H1E1K03)', 'Temp Main Outlet (H1E1K02)', 'Pressure Bag Filter (H1F1P01)', 'Pressure Blower (H1H1P04)',
  ],

  dryer_tower_2: [
    'Stamp:', 'Tanggal', 'Waktu', 'Nama', 'Shift', 'Team', 'Batch', 'Mode', 'Final Tank (FTC0)',
    'Level Final Tank (Ton)', 'Temperatur Final Tank (Level <20% FT temperatue tidak valid)', 'TS Final Tank',
    'Level Feed System Tank (B1K01)(%)', 'Feed Pressure (B1K41)(bar)', 'Speed Feed Pump - CV (B1K41) (% )',
    'Nozzle Pressure - PV (B1K60) (bar)', 'Speed HPP - CV (B1K60) (%)', 'Feed Extract Mass Flow (B1K02) (kg/h)',
    'Factor Gas (gr/kg)', 'Flow Meter CO2 (B1K03)(g/h)', 'Temp Feed Inlet (B1K50) (°C)',
    'Temp Fresh Air (P1P0)(°C)', 'Temp Main Air (E1K02)(°C)', 'Flow Main Air - PV (E1K01)(m3/h)',
    'Speed Motor Main Air - CV (E1K01)(%)', 'Temp SFB Inlet (E1K06)(°C)', 'Flow SFB Inlet - PV (E1K05) (m3/h)',
    'Speed Motor Supply SFB Inlet - CV (E1K05)(%)', 'Temp VF1 inlet (G1K02)( °C )', 'Flow VF1 Inlet (G1K01)(m3/h)',
    'Temp VF2 Inlet (G1K04) ( °C )', 'Flow VF2 Inlet (G1K03)(m3/h)', 'Hydrolyse Pump Speed (E1G1G01)(%)',
    'Temp VF (G1P07)( °C )', 'Δ Pressure Chamber : SFB (E1K07)(mbar)', 'Temp SFB Atas (H1E1P05)(°C)',
    'Temp SFB Bawah (H1E1P06)(°C)', 'Δ Temp SFB (°C)', 'Pressure Chamber (E1K04)(mbar)',
    'Temp Main Outlet (E1K03)(°C)', 'Pressure Bag Filter (F1P01)(mbar)', 'Flow Fine Powder Bag Filter (H1P03)(mbar)',
    'Ampere moto blower H1G01 (A)', 'Keterangan',
  ],

  extraction_tower_1: [
    'ID_No', 'Stamp', 'Tanggal', 'Shift', 'Team', 'Batch', 'Mode', 'Degassing', 'Perculator',
    'Start Extraction', 'Batch of Extraction', 'Amount of Aroma Extract', 'TS Aroma Extract',
    'Amount of Hydrolysis Extract', 'TS Hydrolysis Extract', 'Level Extract Tank', 'Grinding',
    'Moist of R&G coffee', 'Destination Tank Post Extraction', 'TS Extract Tank', 'Nama Petugas',
    'Stop Extraction', 'Keterangan',
  ],

  extraction_tower_2: [
    'ID_No', 'Stamp', 'Tanggal', 'Shift', 'Team', 'Batch', 'Mode', 'Degassing', 'Perculator',
    'Start Extraction', 'Batch of Extraction', 'Amount of Aroma Extract', 'TS Aroma Extract',
    'Amount of Hydrolysis Extract', 'TS Hydrolysis Extract', 'Level', 'Grinding',
    'Moist of R&G coffee', 'Destination Tank Post Extraction', 'TS Extract Tank', 'Nama Petugas',
    'Stop Extraction', 'Nomor Batch', 'Keterangan',
  ],

  evaporation_tower_1: [
    'stamp', 'Tanggal', 'Shift', 'Team', 'Batch', 'Mode', 'Separated Tank', 'Level Separated Tank',
    'TS Separated Tank', 'Nilai Sedimen Separated Tank', 'Start Tank', 'Finish Tank',
    'Destination Final Tank', 'Level Final Tank', 'Pure Aroma', 'TS Final Tank',
    'Temp. Output Evap (di Final Tank)', 'Nama Petugas', 'Keterangan', 'Column 1',
  ],

  evaporation_tower_2: [
    'Stamp:+1', 'Tanggal', 'Shift', 'Team', 'Batch', 'Mode', 'Separated Tank', 'Level Separated Tank',
    'TS Separated Tank', 'Nilai Sedimen Separated Tank', 'Start Tank', 'Finish Tank',
    'Destination Final Tank', 'Level Final Tank', 'Pure Aroma', 'TS Final Tank',
    'Temp, Output Evap (di Final Tank)', 'Nama Petugas', 'Ketereangan',
  ],

  roasting_probat: [
    'Stamp', 'Tanggal', 'Shift', 'Team', 'Batch', 'Mode Goreng', 'Silo Degassing', 'Start',
    'Roasting Time (second)', 'Temperatur End Roast', 'Volume air', 'Warna', 'Foreign Matter',
    'Bau', 'waktu transfer mentah', 'SiloCell 1', 'SiloCell 2', 'SiloCell 3', 'SiloCell 4',
    'SiloCell 5', 'SiloCell 6', 'SiloCell 7', 'SiloCell 8', 'Jenis Kopi Mentah',
    'waktu transfer matang', 'berat kopi matang', 'Waste Batu Destoner', 'Waste cyclone destoner',
    'Susut Goreng', 'Keterangan', 'Nama Petugas',
  ],

  packing_tower_1: [
    'stamp', 'tanggal', 'waktu', 'nama', 'shift', 'team', 'batch', 'pin', 'nama_produk',
    'ok_box', 'hold_box', 'bo_box', 'bo_kg', 'waste_dust_collector_kg', 'waste_metal_separator_kg',
    'waste_sapuan_kg', 'waste_blocking_kg', 'kondisi_dehumidifier', 'temp_ruang_packing',
    'rh_ruang_packing', 'temp_ruang_transit', 'rh_ruang_transit', 'level_prod_dari_bibir_karton', 'keterangan',
  ],

  packing_tower_2: [
    'stamp', 'tanggal', 'waktu', 'nama', 'shift', 'team', 'batch', 'pin', 'nama_produk',
    'ok_box', 'hold_box', 'bo_box', 'bo_kg', 'waste_dust_collector_kg', 'waste_metal_separator_kg',
    'waste_over_size_kg', 'waste_blocking_kg', 'kondisi_dehumidifier', 'temp_ruang_packing',
    'rh_ruang_packing', 'temp_ruang_transit', 'rh_ruang_transit', 'level_prod_dari_bibir_karton', 'keterangan',
  ],
};

module.exports = { TABLE_COLUMNS_MAP };

