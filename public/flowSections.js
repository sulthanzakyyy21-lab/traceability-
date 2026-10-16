// Form F/QC/01.030 - Official Flow Process Template
const FLOW_SECTIONS = [
  {
    "name": "DISTRIBUSI",
    "totalRows": 13,
    "blocks": [
      {
        "pic": "FGW",
        "docs": [
          "- Surat Jalan Antar Gudang",
          "- F-SC-02.2 Rencana Pengiriman dan Pengambilan Barang Jadi",
          "- F-SC-02.4 Checklist Pengiriman"
        ],
        "items": [
          {
            "label": "Posisi produk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Waktu pengiriman",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer surat jalan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tujuan pengiriman",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Lokasi gudang penyimpanan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer rak",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer pallet",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC FGW",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- CoA/IC/SJA-SKD"
        ],
        "items": [
          {
            "label": "Nomor Certificate of Analysis (CoA)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi kendaraan pengiriman",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "PACKING",
    "totalRows": 66,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- F/PRO/02.14 Laporan Hasil Produksi",
          "- QF/PROD/IC/013 Data Hasil Printer Label untuk Hasil Produksi",
          "- QF/PROD/IC/042 Checklist Pengecekan Metal Detector Packing",
          "- QF/PROD/IC/019 Checklist Validasi Metal Detector Packing",
          "- F/PRO/02.40 Checklist Cleaning Packing dan Transit (Area Instrument dan Personal)"
        ],
        "items": [
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Shift",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nama operator packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nama helper packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Waktu dan hasil verifikasi/validasi CCP",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Suhu dan RH ruang packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Checklist kebersihan area packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "No Lot/Batch karton",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nama supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "No Lot/Batch plastik",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nama supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Berat box",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Total output produk",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- F/QC/01.15 Hasil Analisa Produk Spray Dryer",
          "- QF/PDQC/QC/026 Hasil Analisa Mikrobiologi"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Finished Goods",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Verifikasi label",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kondisi visual kemasan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kadar air",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Warna",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Floating Particles",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Fluidity",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Solubility",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Body",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sepat",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Particle Size",
            "isHeader": false,
            "key": null
          },
          {
            "label": ">600",
            "isHeader": false,
            "key": null
          },
          {
            "label": "425-600",
            "isHeader": false,
            "key": null
          },
          {
            "label": "300-425",
            "isHeader": false,
            "key": null
          },
          {
            "label": "250-300",
            "isHeader": false,
            "key": null
          },
          {
            "label": "212-250",
            "isHeader": false,
            "key": null
          },
          {
            "label": "180-212",
            "isHeader": false,
            "key": null
          },
          {
            "label": "150-180",
            "isHeader": false,
            "key": null
          },
          {
            "label": "<150",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Analisa Mikrobiologi",
            "isHeader": true,
            "key": null
          },
          {
            "label": "TPC",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Yeast & Mold",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Status Produk",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Jumlah Produk Status OK",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah Produk Status BO",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "COP Instrument",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu COP instrument packing terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi swab ATP",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC Prod dan PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "",
        "docs": [
          "- F/QC.2.35 Environment Monitoring Program"
        ],
        "items": [
          {
            "label": "Environmental Swab",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu Environmental Swab internal terakhir (non pathogen)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "List intrument dan personal serta hasil swab",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC Prod dan PA",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Waktu Environmental Swab eksternal terakhir (pathogen)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "List intrument dan personal serta hasil swab",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC Prod dan PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "",
        "docs": [
          "- F/QC.2.5 Air Bacteria Expose"
        ],
        "items": [
          {
            "label": "Air Bacteria Exposed",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu Air Bacteria Exposed terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Hasil Air Bacteria Exposed",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC Prod dan PA",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "REWORK",
    "totalRows": 29,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- QF/PROD/IC/054 Checklist Proses Rework (Tower 1)",
          "- QF/PROD/IC/083 Checklist Proses Rework (Tower 2)"
        ],
        "items": [
          {
            "label": "Jumlah bahan rework (in box)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal serah terima bahan rework dari GBJ",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Identitas bahan rework yang dipakai",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Lokasi rework (Tower 1/Tower 2)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Formula disposisi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Target TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Level tank rework",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Transfer hasil rework ke",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "CIP Tank Rework",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu CIP terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Konsentrasi lye",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi Final Rinse",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/016 Analisa Rework"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Rework",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Verifikasi bahan rework",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual/FM",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix/TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Viskositas",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Screening Test",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Status",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "DRYER",
    "totalRows": 28,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- QF/PROD/IC/011 Checklist Scada Dryer (Tower 1)",
          "- QF/PROD/IC/069 Checklist Scada Dryer (Tower 2)"
        ],
        "items": [
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": "dryer_waktu_proses"
          },
          {
            "label": "Parameter kritis proses",
            "isHeader": false,
            "key": "dryer_parameter_kritis"
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": "dryer_abnormalitas"
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": "dryer_operator"
          },
          {
            "label": "Pemakaian Gas CO2 (yg dipakai saat itu)",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Nama supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal kedatangan",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "CIP Dryer",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu CIP terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Konsentrasi lye",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi Final Rinse",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- F/QC/01.15 Hasil Analisa Produk Spray Dryer"
        ],
        "items": [
          {
            "label": "Monitoring Kualitas Produk di VF2",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Kadar air",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Warna",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Floating Particles",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Body",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sepat",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "EVAPORATION",
    "totalRows": 42,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- QF/PROD/IC/007 (Tower 1)",
          "- QF/PROD/IC/059 (Tower 2)"
        ],
        "items": [
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": "evap_waktu_proses"
          },
          {
            "label": "Parameter kritis proses",
            "isHeader": false,
            "key": "evap_parameter_kritis"
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": "evap_abnormalitas"
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": "evap_operator"
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "CIP Evaporator",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu CIP/flushing terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Konsentrasi lye",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi Final Rinse",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/013 Hasil Analisa Produk Evaporasi"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Produk Evaporation",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix/TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Viskositas",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Screening Test",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/014 Hasil Analisa Produk Final Tank"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Produk Final Tank (after circulation)",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Nomer Final Tank",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah Pure Aroma",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Level Final Tank",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix/TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Viskositas",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Screening Test",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "CIP Final Tank",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu CIP terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Konsentrasi lye",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi Final Rinse",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Swab ATP",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "EXTRACTION",
    "totalRows": 52,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- QF/PROD/IC/008 Parameter Proses Ekstraksi Mode FIC / CONVENTIONAL (Tower 1)",
          "- F/PROD/02.18 Parameter Proses Ekstraksi Mode Dual2 (Tower 1)",
          "- QF/PROD/IC/058 Parameter Proses Ekstraksi Mode FIC / CONVENTIONAL (Tower 2)"
        ],
        "items": [
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": "ext_waktu_proses"
          },
          {
            "label": "Mode ekstraksi",
            "isHeader": false,
            "key": "ext_mode"
          },
          {
            "label": "Jumlah percolator",
            "isHeader": false,
            "key": "ext_percolator"
          },
          {
            "label": "Parameter kritis proses",
            "isHeader": false,
            "key": "ext_parameter_kritis"
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": "ext_abnormalitas"
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": "ext_operator"
          },
          {
            "label": "Penggunaan Antifoam",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Nama supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal kedatangan",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/010 Laporan Kontrol Hasil Cleaning dan Hygiene Peralatan Produksi"
        ],
        "items": [
          {
            "label": "CIP Ekstraktor",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu CIP terakhir",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Konsentrasi lye",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi Final Rinse",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/008 Hasil Analisa Grinding",
          "- QF/PDQC/QC/009 Hasil Analisa Ekstraksi Aroma",
          "- QF/PDQC/QC/010 Hasil Analisa Ekstraksi Hidrolise",
          "- QF/PDQC/QC/011 Hasil Analisa Pure Aroma",
          "- QF/PDQC/QC/012 Hasil Analisa Tank System & Separation"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Grinding",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Asal silo degassing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "RGA/RGB",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Particle Size",
            "isHeader": false,
            "key": null
          },
          {
            "label": "<850",
            "isHeader": false,
            "key": null
          },
          {
            "label": "850-<1000",
            "isHeader": false,
            "key": null
          },
          {
            "label": "1000-<2350",
            "isHeader": false,
            "key": null
          },
          {
            "label": "2350-<3350",
            "isHeader": false,
            "key": null
          },
          {
            "label": "3350-<4000",
            "isHeader": false,
            "key": null
          },
          {
            "label": "4000-<5600",
            "isHeader": false,
            "key": null
          },
          {
            "label": "5600-<6300",
            "isHeader": false,
            "key": null
          },
          {
            "label": ">6300",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kadar air",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Density",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Analisa Kualitas Aroma",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Asal silo degassing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix/TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Suhu",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Analisa Kualitas Hidrolise",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Asal silo degassing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix/TS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Suhu",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "WATER PROCESS",
    "totalRows": 15,
    "blocks": [
      {
        "pic": "PA",
        "docs": [
          "- QF/PDQC/SS/003 Hasil Analisa Air Proses"
        ],
        "items": [
          {
            "label": "Analisa Fisika Kimia",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Waktu analisa",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "TDS",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kekeruhan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kesadahan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sisa Khlor",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Mangan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Besi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Warna",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Aluminium",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Analisa Mikrobiologi",
            "isHeader": true,
            "key": null
          },
          {
            "label": "E-Coli",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Total Coliform",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC PA",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "ROASTING",
    "totalRows": 22,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- F/PRO/01.015 Checklist Hasil Produksi Roasting Scolari",
          "- F/PRO/01.04 Checklist Hasil Produksi Roasting Probat"
        ],
        "items": [
          {
            "label": "Waktu proses",
            "isHeader": false,
            "key": "roast_waktu_proses"
          },
          {
            "label": "Mesin goreng (PRB/SCL1/SCL2)",
            "isHeader": false,
            "key": "roast_mesin"
          },
          {
            "label": "Jenis kopi goreng",
            "isHeader": false,
            "key": "roast_mode"
          },
          {
            "label": "Silo Degassing",
            "isHeader": false,
            "key": "roast_silo"
          },
          {
            "label": "Jumlah batch",
            "isHeader": false,
            "key": "roast_jumlah_batch"
          },
          {
            "label": "Parameter kritis proses",
            "isHeader": false,
            "key": "roast_parameter_kritis"
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": "roast_abnormalitas"
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": "roast_operator"
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/005 Monitoring Mutu Kopi Goreng"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Kopi Goreng",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Visual/Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Warna",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kadar Air",
            "isHeader": false,
            "key": null
          },
          {
            "label": "pH",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Brix",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Score Cuptest",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Wangi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Asam",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Pahit",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sepat",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Body",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Bau Asing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "UPBM",
    "totalRows": 8,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- F/PRO/01.01 Checklist Laporan Pengisian Silo"
        ],
        "items": [
          {
            "label": "Waktu inload",
            "isHeader": false,
            "key": "upbm_waktu_inload"
          },
          {
            "label": "Nomor BSTB inload",
            "isHeader": false,
            "key": "upbm_bstb"
          },
          {
            "label": "Jenis biji kopi mentah",
            "isHeader": false,
            "key": "upbm_jenis_biji"
          },
          {
            "label": "Silo cell",
            "isHeader": false,
            "key": "upbm_silo_cell"
          },
          {
            "label": "Disposisi",
            "isHeader": false,
            "key": "upbm_disposisi"
          },
          {
            "label": "Total jumlah biji kopi mentah yang dipakai",
            "isHeader": false,
            "key": "upbm_total_biji"
          },
          {
            "label": "Catatan abnormalitas proses",
            "isHeader": false,
            "key": "upbm_abnormalitas"
          },
          {
            "label": "Operator produksi",
            "isHeader": false,
            "key": "upbm_operator"
          }
        ]
      }
    ]
  },
  {
    "name": "MASS BALANCE PRODUKSI",
    "totalRows": 4,
    "blocks": [
      {
        "pic": "Produksi",
        "docs": [
          "- Formula Neraca Massa Produksi"
        ],
        "items": [
          {
            "label": "Total output produk",
            "isHeader": false,
            "key": "mb_output"
          },
          {
            "label": "Total kopi goreng yang ditransfer",
            "isHeader": false,
            "key": "mb_kopi_goreng"
          },
          {
            "label": "Total kopi mentah",
            "isHeader": false,
            "key": "mb_kopi_mentah"
          },
          {
            "label": "Rasio IC",
            "isHeader": false,
            "key": "mb_rasio_ic"
          }
        ]
      }
    ]
  },
  {
    "name": "INCOMING BAHAN",
    "totalRows": 18,
    "blocks": [
      {
        "pic": "RMW",
        "docs": [
          "- F/SC/01.06 Bukti Serah Terima Barang (RMW)",
          "- F/SC/01.05 Form Pengambilan Barang di GBB"
        ],
        "items": [
          {
            "label": "Tanggal kedatangan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jenis bahan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nama supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomor truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomor Surat Jalan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah (kg)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi kondisi truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal serah terima ke UPBM",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC RMW",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/031 Hasil Analisa Defect Biji Kopi Mentah",
          "- F/QC/01.1 Kedatangan Biji Kopi Mentah"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Kedatangan Biji Kopi Mentah",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Serangga hidup",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Biji berbau",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Warna",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Kadar air",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Biji OK",
            "isHeader": false,
            "key": null
          },
          {
            "label": "% Foreign Matter",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Status",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  },
  {
    "name": "INCOMING BAHAN KEMAS",
    "totalRows": 37,
    "blocks": [
      {
        "pic": "FGW",
        "docs": [
          "- F/SC/02.6 Checklist Terima Barang",
          "- F/SC/02.11 Bon Bahan Packing"
        ],
        "items": [
          {
            "label": "KARTON",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Tanggal kedatangan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomor truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer PO",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer Lot/Batch",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi kondisi truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal serah terima ke packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC FGW",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/017 Monitoring Mutu Kemasan"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Kedatangan Karton",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Kondisi fisik",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Berat",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Dimensi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Printing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sealing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "BCT (CoA)",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Status",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "FGW",
        "docs": [
          "- F/SC/02.6 Checklist Terima Barang",
          "- F/SC/02.11 Bon Bahan Packing"
        ],
        "items": [
          {
            "label": "PLASTIK",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Tanggal kedatangan",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Supplier",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomor truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer PO",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Nomer Lot/Batch",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Jumlah",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Verifikasi kondisi truk",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Tanggal serah terima ke packing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC GBJ",
            "isHeader": false,
            "key": null
          }
        ]
      },
      {
        "pic": "QC",
        "docs": [
          "- QF/PDQC/QC/017 Monitoring Mutu Kemasan"
        ],
        "items": [
          {
            "label": "Analisa Kualitas Kedatangan Plastik",
            "isHeader": true,
            "key": null
          },
          {
            "label": "Kondisi fisik",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Berat",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Dimensi",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Sealing",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Swab Test ATP",
            "isHeader": false,
            "key": null
          },
          {
            "label": "Status",
            "isHeader": false,
            "key": null
          },
          {
            "label": "PIC QC",
            "isHeader": false,
            "key": null
          }
        ]
      }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.FLOW_SECTIONS = FLOW_SECTIONS;
}
if (typeof module !== 'undefined') {
  module.exports = FLOW_SECTIONS;
}
