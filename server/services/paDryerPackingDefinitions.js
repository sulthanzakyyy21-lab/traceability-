const PLANT1_DRYER_CHECKLIST = [
  { no: 1, item: 'Line Sirkulasi Final Tank C01 s/d C03', swab: null, floor: 'Lt. 1' },
  { no: 2, item: 'Line Final Tank C01 s/d C03 to Feed Tank', swab: null, floor: 'Lt. 1' },
  { no: 3, item: 'Feed Tank Dryer', swab: '1', floor: 'Lt. 1' },
  { no: 4, item: 'Feed System (nozzle + recycle)', swab: null, floor: 'Lt. 5' },
  { no: 5, item: 'Feed Line (nozzle only)', swab: null, floor: 'Lt. 5' },
  { no: 6, item: 'Dryer Chamber dan VF', swab: null, floor: 'Lt. 2' },
  { no: 7, item: 'COP Bag Filter', swab: null, floor: 'Lt. 5' },
  { no: 8, item: 'Final Tank 1', swab: '1', floor: 'Lt. 1' },
  { no: 9, item: 'Final Tank 2', swab: '1', floor: 'Lt. 1' },
  { no: 10, item: 'Final Tank 3', swab: '1', floor: 'Lt. 1' }
];

const PLANT2_DRYER_CHECKLIST = [
  { no: 1, item: 'Line Sirkulasi Final Tank C100 s/d C300', swab: null, floor: 'Lt. 1' },
  { no: 2, item: 'Line Final Tank C100 s/d C300 to Feed Tank', swab: null, floor: 'Lt. 1' },
  { no: 3, item: 'Feed Tank Dryer', swab: '1', floor: 'Lt. 1' },
  { no: 4, item: 'Feed System (nozzle + recycle)', swab: null, floor: 'Lt. 8' },
  { no: 5, item: 'Feed Line (nozzle only)', swab: null, floor: 'Lt. 8' },
  { no: 6, item: 'Dryer Chamber dan VF', swab: null, floor: 'Lt. 3' },
  { no: 7, item: 'COP Bag Filter', swab: null, floor: 'Lt. 8' },
  { no: 8, item: 'Final Tank 100', swab: '1', floor: 'Lt. 1' },
  { no: 9, item: 'Final Tank 200', swab: '1', floor: 'Lt. 1' },
  { no: 10, item: 'Final Tank 300', swab: '1', floor: 'Lt. 1' }
];

const PLANT1_PACKING_CHECKLIST = [
  { no: 1, item: 'COP Sieveter', swab: '1', floor: 'Lt. 2' },
  { no: 2, item: 'COP Hopper Atas lt. 2', swab: '1', floor: 'Lt. 2' },
  { no: 3, item: 'COP Screw Besar dan Kecil', swab: '1', floor: 'Lt. 1' },
  { no: 4, item: 'Line Metal Detector', swab: null, floor: 'Lt. 1' },
  { no: 5, item: 'COP Weighing Hopper', swab: '1', floor: 'Lt. 2' },
  { no: 6, item: 'Line Produk Oversize', swab: null, floor: 'Lt. 1' },
  { no: 7, item: 'Line Produk BO', swab: null, floor: 'Lt. 1' },
  { no: 8, item: 'Line Produk BO Metal Detector', swab: null, floor: 'Lt. 1' },
  { no: 9, item: 'Filter AHU', swab: null, floor: 'Lt. 1' },
  { no: 10, item: 'Filter Dust Collector', swab: null, floor: 'Lt. 1' },
  { no: 11, item: 'COP Dehumidifier', swab: null, floor: 'Lt. 1' }
];

const PLANT2_PACKING_CHECKLIST = [
  { no: 1, item: 'COP Sieveter', swab: '1', floor: 'Lt. 3' },
  { no: 2, item: 'COP IC Silo', swab: '1', floor: 'Lt. 2' },
  { no: 3, item: 'COP Hopper dan Screw Auger', swab: '1', floor: 'Lt. 1', aliases: ['cop hopper screw auger dan line by pass'] },
  { no: 4, item: 'Line Produk Oversize', swab: null, floor: 'Lt. 1' },
  { no: 5, item: 'Line Produk BO', swab: null, floor: 'Lt. 1' },
  { no: 6, item: 'Line produk by pass', swab: '1', floor: 'Lt. 1', aliases: ['cop hopper screw auger dan line by pass'] },
  { no: 7, item: 'COP Head Filling Produk', swab: '1', floor: 'Lt. 1' },
  { no: 8, item: 'Line Metal Detector', swab: null, floor: 'Lt. 1' },
  { no: 9, item: 'Filter AHU', swab: null, floor: 'Lt. 1' },
  { no: 10, item: 'Filter Dust Collector', swab: null, floor: 'Lt. 1' }
];

module.exports = {
  PLANT1_DRYER_CHECKLIST,
  PLANT2_DRYER_CHECKLIST,
  PLANT1_PACKING_CHECKLIST,
  PLANT2_PACKING_CHECKLIST
};

