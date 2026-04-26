// ============================================================
// BANCO DE DADOS — Gerar Laudo Colonoscopia
// Salvo em: 13/04/2026, 15:47:41
// ============================================================

var DB_PADRAO = {
  "indicacao": [
    {
      "nome": "Rastreamento",
      "valor": "rastreamento para câncer colorretal."
    },
    {
      "nome": "Seguimento polipect",
      "valor": "seguimento pós-polipectomia."
    },
    {
      "nome": "Seguimento ressec",
      "valor": "seguimento pós-ressecção de lesão."
    },
    {
      "nome": "Ressecção de lesão",
      "valor": "ressecção de lesão."
    },
    {
      "nome": "Dor abd",
      "valor": "dor abdominal"
    },
    {
      "nome": "Constipação",
      "valor": "constipação."
    },
    {
      "nome": "Alt de hab int",
      "valor": "alteração de hábito intestinal."
    },
    {
      "nome": "Diarreia",
      "valor": "investigação de quadro diarreico."
    },
    {
      "nome": "Sagramento",
      "valor": "investigação de sangramento esporádico à evacuação."
    },
    {
      "nome": "HDB",
      "valor": "suspeita de hemorragia digestiva baixa."
    },
    {
      "nome": "Preventivo",
      "valor": "preventivo."
    },
    {
      "nome": "FIT+",
      "valor": "exame de sangue oculto nas fezes positivo."
    }
  ],
  "equipamento": [
    {
      "nome": "EC-760Z",
      "valor": "exame realizado com colonoscópio Fujifilm EC-760Z, que possui magnificação de imagem e cromoscopia digital.<br>Insuflação com CO2."
    },
    {
      "nome": "EC-760ZP",
      "valor": "exame realizado com colonoscópio Fujifilm EC-760ZP, que possui magnificação de imagem e cromoscopia digital.<br>Insuflação com CO2."
    },
    {
      "nome": "EG-760Z",
      "valor": "exame realizado com endoscópio Fujifilm EG-760Z, que possui magnificação de imagem e cromoscopia digital.<br>Insuflação com CO2."
    },
    {
      "nome": "EC-760ZP sem mag",
      "valor": "exame realizado com colonoscópio Fujifilm EC-760ZP, que possui cromoscopia digital, porém sem magnificação de imagem disponível no momento.<br>Insuflação com CO2."
    },
    {
      "nome": "EC-760R",
      "valor": "exame realizado com colonoscópio Fujifilm EC760R, que possui cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    },
    {
      "nome": "EC-590Z",
      "valor": "exame realizado com colonoscópio Fujifilm EC-590Z, que possui magnificação de imagem e cromoscopia digital.<br>Insuflação com CO2."
    },
    {
      "nome": "EC-600WL",
      "valor": "exame realizado com colonoscópio Fujifilm EC-600WL, que possui cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    },
    {
      "nome": "CF-170L",
      "valor": "exame realizado com colonoscópio Olympus CF-170L, que possui cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    },
    {
      "nome": "CF-H180AL",
      "valor": "exame realizado com colonoscópio Olympus CF-H180AL, que possui cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    },
    {
      "nome": "CF-H190",
      "valor": "exame realizado com colonoscópio Olympus CF-H190, que possui cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    },
    {
      "nome": "CF-HQ190",
      "valor": "exame realizado com colonoscópio Olympus CF-HQ190, que possui near focus, cromoscopia digital e imagem HD.<br>Insuflação com CO2."
    }
  ],
  "sedacao": [
    {
      "nome": "Anestesista",
      "id": "Anestesista",
      "valor": "equipe de anestesiologia."
    },
    {
      "nome": "UTI",
      "id": "UTI",
      "valor": "equipe intensivista."
    },
    {
      "nome": "Anestesia geral",
      "id": "geral",
      "valor": "Paciente sob anestesia geral."
    }
  ],
  "sedacaoSelects": {
    "fentanil": [
      "50mcg",
      "75mcg",
      "100mcg",
      ""
    ],
    "midazolam": [
      "1mg",
      "2mg",
      "2,5mg",
      "3mg",
      "4mg",
      "5mg",
      ""
    ]
  },
  "preparo": [
    {
      "nome": "Boston 3+3+3",
      "valor": "Preparo adequado para o exame (Boston 9)."
    },
    {
      "nome": "Boston 2+3+3",
      "valor": "Preparo adequado após lavagem com água em cólon direito (Boston 2+3+3)."
    },
    {
      "nome": "Boston 2+2+3",
      "valor": "Preparo adequado após lavagem com água de cólons ascendente e transverso (Boston 2+2+3)."
    },
    {
      "nome": "Boston 2+2+2",
      "valor": "Preparo adequado após lavagem de todos os segmentos com água (Boston 2+2+2)."
    },
    {
      "nome": "Preparo regular",
      "valor": "Presença de resíduos parcialmente laváveis em cólon direito, que reduzem a qualidade do exame e a taxa de detecção de adenomas (Boston 1+2+2)."
    }
  ],
  "exame": [
    {
      "nome": "Normal",
      "id": "checkbox11",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal, que não apresenta alterações em seus 5 cm distais.<br>Preparo adequado para o exame (Boston 9).<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br>Cólons ascendente, transverso, descendente e sigmoide com trama vascular e mucosa de aspecto normal.<br>Reto sem alterações."
    },
    {
      "nome": "Alteração em segmento único",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal, que não apresenta alterações em seus 5 cm distais.<br>Preparo adequado para o exame (Boston 9).<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br>"
    },
    {
      "nome": "Múltiplos achados",
      "id": "Multiplos-achados-sortable-exame",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal, que não apresenta alterações em seus 5 cm distais. <br>Preparo adequado para o exame (Boston 9).<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br><br>A mucosa colorretal apresenta aspecto geral preservado, exceto pelos seguintes achados:"
    },
    {
      "nome": "Retossigmoidoscopia",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o cólon descendente.<br>Preparo adequado para o exame.<br>Cólon sigmoide e reto apresentam mucosa com aspecto preservado e sem deformidades."
    },
    {
      "nome": "Colect esq reconst",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal, que não apresenta alterações em seus 5 cm distais. <br>Preparo adequado para o exame.<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br>Cólons ascendente e transverso remanescente com mucosa e trama vascular de aspecto preservado.<br>Ausência de cólons descendente e sigmoide com anastomose colorretal ampla e sem lesões.<br>Reto remanescente sem alterações.<br>"
    },
    {
      "nome": "Colect dir reconst",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal.<br>Preparo adequado para o exame.<br>Ausência de cólon ascendente, ceco e válvula ileocecal por ressecção cirúrgica prévia.<br>Íleo-transverso anastomose ampla e sem lesões associadas.<br>Cólons transverso remanescente, descendente e sigmoide com mucosa e trama vascular de aspecto preservado.<br>Reto sem alterações.<br><br>"
    },
    {
      "nome": "Retossigmoidect c/ reconst",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal até o íleo terminal, que não apresenta alterações em seus 5 cm distais. <br>Preparo adequado para o exame.<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br>Cólons ascendente, transverso e descendente com trama vascular e mucosa de aspecto normal.<br>Ausência de cólon sigmoide.<br>A cerca de 10cm da borda anal, encontra-se anastomose colorretal ampla e sem lesões associadas.<br>Reto remanescente sem alterações.<br>"
    },
    {
      "nome": "Hartmann + retite de desuso",
      "valor": "Toque retal sem alterações.<br>Introdução do colonoscópio pelo canal anal, observando-se reto com mucosa friável e sem lesões. Fundo cego a cerca de 8cm do canal a anal.<br>Preparo adequado para o exame.<br><br>Introdução do colonoscópio por colostomia terminal, localizada em flanco esquerdo, até o íleo terminal, que não apresenta alterações em seus 5 cm distais.<br>Ceco, válvula ileocecal e óstio apendicular sem alterações.<br>A mucosa do cólon remanescente apresenta aspecto preservado.<br>"
    }
  ],
  "lesoes": {
    "localizacao": [
      {
        "valor": "ceco",
        "label": "ceco"
      },
      {
        "valor": "cólon ascendente",
        "label": "ascendente"
      },
      {
        "valor": "ângulo hepático",
        "label": "ang hepático"
      },
      {
        "valor": "cólon transverso",
        "label": "transverso"
      },
      {
        "valor": "ângulo esplênico",
        "label": "ang esplênico"
      },
      {
        "valor": "cólon descendente",
        "label": "descendente"
      },
      {
        "valor": "cólon sigmoide",
        "label": "sigmoide"
      },
      {
        "valor": "reto",
        "label": "reto"
      }
    ],
    "paris": [
      {
        "valor": "pólipo séssil com cerca de",
        "label": "Is",
        "extra": "Pólipo séssil"
      },
      {
        "valor": "pólipo subpediculado com cerca de",
        "label": "Isp",
        "extra": "Pólipo subpediculado"
      },
      {
        "valor": "pólipo pediculado com cerca de",
        "label": "Ip",
        "extra": "Pólipo pediculado"
      },
      {
        "valor": "lesão planoelevada com cerca de",
        "label": "IIa",
        "extra": "Lesão planoelevada"
      },
      {
        "valor": "lesão planodeprimida com cerca de",
        "label": "IIc",
        "extra": "Lesão planodeprimida"
      },
      {
        "valor": "lesão de crescimento lateral granular homogênea com cerca de",
        "label": "LST-GH",
        "extra": "LST-GH"
      },
      {
        "valor": "lesão de crescimento lateral granular nodular mista com cerca de",
        "label": "LST nod mista",
        "extra": "LST granular nodular mista"
      },
      {
        "valor": "lesão de crescimento lateral não granular planoelevada com cerca de",
        "label": "LST planoelevada",
        "extra": "LST-NG planoelevada"
      },
      {
        "valor": "lesão de crescimento lateral não granular pseudodeprimida com cerca de",
        "label": "LST pseudodeprimida",
        "extra": "LST-NG pseudodeprimida"
      },
      {
        "valor": "angiectasia sem sinais de sangramento com cerca de",
        "label": "Angiectasia",
        "extra": "Angiectasia"
      },
      {
        "valor": "lesão elevada de coloração amarelada, amolecida e aspecto subepitelial medindo cerca de",
        "label": "Lipoma",
        "extra": "Lipoma"
      }
    ],
    "numero": [
      {
        "valor": "",
        "label": "1",
        "extra": "01"
      },
      {
        "valor": "dois",
        "label": "2",
        "extra": "02"
      },
      {
        "valor": "três",
        "label": "3",
        "extra": "03"
      },
      {
        "valor": "quatro",
        "label": "4",
        "extra": "04"
      },
      {
        "valor": "cinco",
        "label": "5",
        "extra": "05"
      },
      {
        "valor": "seis",
        "label": "6",
        "extra": "06"
      },
      {
        "valor": "sete",
        "label": "7",
        "extra": "07"
      },
      {
        "valor": "oito",
        "label": "8",
        "extra": "08"
      }
    ],
    "tamanho": [
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      15,
      20,
      25,
      30,
      35,
      40
    ],
    "ateTamanho": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": " a 5",
        "label": "5mm"
      },
      {
        "valor": " a 6",
        "label": "6mm"
      },
      {
        "valor": " a 7",
        "label": "7mm"
      },
      {
        "valor": " a 8",
        "label": "8mm"
      },
      {
        "valor": " a 9",
        "label": "9mm"
      },
      {
        "valor": " a 10",
        "label": "10mm"
      }
    ],
    "kudo": [
      {
        "valor": "",
        "label": "-",
        "extra": ""
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, observam-se criptas de aspecto normal",
        "label": "I",
        "extra": " (Kudo I; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas estreladas que sugerem lesão hiperplásica",
        "label": "II",
        "extra": " (Kudo II; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas estreladas que sugerem lesão hiperplásica",
        "label": "II-L",
        "extra": " (Kimura II-L; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas ovaladas que sugerem lesão serrilhada séssil",
        "label": "II-O",
        "extra": " (Kimura II-O; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas alongadas que sugerem adenoma tubular",
        "label": "III-L",
        "extra": " (Kudo IIIL; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas cerebriformes que sugerem adenoma viloso",
        "label": "IV",
        "extra": " (Kudo IV; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas cerebriformes alargadas que sugerem lesão serrilhada tradicional",
        "label": "IV-S",
        "extra": " (Kimura IV-S; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas com discreta irregularidade, que estão realicionadas ao grupo IV da classificação de Vienna,",
        "label": "Vi low",
        "extra": " (Kudo Vi; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas com irregularidade intensa",
        "label": "Vi high",
        "extra": " (Kudo Vi; "
      },
      {
        "valor": ". À avaliação com cromoscopia e magnificação, a lesão apresenta criptas com irregularidade intensa e áreas amorfas",
        "label": "Vn",
        "extra": " (Kudo Vn; "
      }
    ],
    "vasc": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": " com vasos regulares",
        "label": "Regular"
      },
      {
        "valor": " com vasos dilatados e tortuosos",
        "label": "Irregular"
      },
      {
        "valor": " com áreas avasculares",
        "label": "Avascular"
      }
    ],
    "jnet": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": "JNET 1)",
        "label": "JNET 1"
      },
      {
        "valor": "JNET 2A)",
        "label": "JNET 2A"
      },
      {
        "valor": "JNET 2B)",
        "label": "JNET 2B"
      },
      {
        "valor": "JNET 3)",
        "label": "JNET 3"
      }
    ],
    "resseccao": [
      {
        "valor": ". Ressecção com fórceps a frio",
        "label": "Fórceps",
        "extra": ". Polipectomia"
      },
      {
        "valor": ". Ressecção com alça a frio",
        "label": "Alça a frio",
        "extra": ". Polipectomia"
      },
      {
        "valor": ". Ressecção com alça diatérmica",
        "label": "Alça diatérmica",
        "extra": ". Polipectomia com eletrocauterização"
      },
      {
        "valor": ". Ressecção por mucosectomia em monobloco pela técnica clássica",
        "label": "EMR clássica",
        "extra": ". Mucosectomia em monobloco"
      },
      {
        "valor": ". Ressecção por mucosectomia em monobloco pela técnica de pré-corte",
        "label": "EMR precut",
        "extra": ". Mucosectomia em monobloco"
      },
      {
        "valor": ". Ressecção por mucosectomia em monobloco pela técnica underwater",
        "label": "EMR underwater",
        "extra": ". Mucosectomia em monobloco"
      },
      {
        "valor": ". Injeção de voluven a 6% e ressecção em monobloco por dissecção endoscópica submucosa (ESD) sem intercorrências",
        "label": "ESD",
        "extra": ". Ressecção em monobloco por ESD"
      },
      {
        "valor": ". Injeção de voluven a 6% e dissecção endoscópica submucosa (ESD) de cerca de 90% da lesão e finalização da ressecção com alça diatérmica em monobloco sem intercorrências",
        "label": "Híbrida",
        "extra": ". Ressecção em monobloco por técnica híbrida (ESD + mucosectomia)"
      },
      {
        "valor": "",
        "label": "-",
        "extra": ""
      }
    ],
    "resseccao3": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": " e fórceps a frio",
        "label": "Fórceps"
      },
      {
        "valor": " e alça a frio",
        "label": "Alça a frio"
      },
      {
        "valor": " e alça diatérmica",
        "label": "Alça diatérmica"
      },
      {
        "valor": " e por mucosectomia em monobloco pela técnica clássica",
        "label": "EMR"
      },
      {
        "valor": " e por mucosectomia em monobloco pela técnica underwater",
        "label": "EMR underwater"
      }
    ],
    "hemostasia": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": ", optando-se por hemostasia profilática com clipe metálico",
        "label": "Profilática clipe"
      },
      {
        "valor": ", optando-se por hemostasia profilática com clipes metálicos",
        "label": "Profilática clipes"
      },
      {
        "valor": ", notando-se sangramento de pequena monta. Realizada hemostasia com clipe metálico",
        "label": "Terapêutica clipe"
      },
      {
        "valor": ", notando-se sangramento de pequena monta. Realizada hemostasia com clipes metálicos",
        "label": "Terapêutica clipes"
      },
      {
        "valor": ". Realizada revisão de hemostasia com eletrocauterização em modo soft após",
        "label": "Revisão soft"
      },
      {
        "valor": ". Realizada revisão de hemostasia com eletrocauterização em modo soft e aproximação parcial das margens do leito de ressecção após",
        "label": "Revisão e fechamento parcial"
      },
      {
        "valor": ". Realizada revisão de hemostasia com eletrocauterização em modo soft e aproximação das margens do leito de ressecção após",
        "label": "Revisão e fechamento total"
      }
    ]
  },
  "diverticulos": {
    "local": [
      {
        "valor": "ceco",
        "label": "ceco"
      },
      {
        "valor": "cólon ascendente",
        "label": "ascendente"
      },
      {
        "valor": "cólon transverso",
        "label": "transverso"
      },
      {
        "valor": "cólon descendente",
        "label": "descendente"
      },
      {
        "valor": "cólon sigmoide",
        "label": "sigmoide"
      },
      {
        "valor": "cólon direito",
        "label": "cólon direito"
      },
      {
        "valor": "cólon esquerdo",
        "label": "cólon esquerdo"
      },
      {
        "valor": "todos os segmentos",
        "label": "difusa"
      },
      {
        "valor": "todos os segmentos, sendo mais frequentes em cólon esquerdo",
        "label": "difusa + à esq"
      }
    ],
    "local2": [
      {
        "valor": "",
        "label": "-"
      },
      {
        "valor": " e ascendente",
        "label": "ascendente"
      },
      {
        "valor": " e transverso",
        "label": "transverso"
      },
      {
        "valor": " e descendente",
        "label": "descendente"
      },
      {
        "valor": " e sigmoide",
        "label": "sigmoide"
      }
    ],
    "frequencia": [
      {
        "valor": "raros e esparsos",
        "label": "Raros e esparsos",
        "extra": "Divertículos esparsos em "
      },
      {
        "valor": "raros",
        "label": "Raros",
        "extra": "Divertículos em "
      },
      {
        "valor": "alguns",
        "label": "Alguns",
        "extra": "Doença diverticular de "
      },
      {
        "valor": "numerosos",
        "label": "Numerosos",
        "extra": "Doença diverticular de "
      }
    ]
  },
  "canalAnal": {
    "alteracao": [
      {
        "valor": "notam-se vasos hemorroidários discretamente ingurgitados",
        "label": "vasos discretamente ingurgitados",
        "extra": ""
      },
      {
        "valor": "notam-se vasos hemorroidários ingurgitados",
        "label": "hemorroidas",
        "extra": "Hemorroidas"
      },
      {
        "valor": "nota-se enantema focal em mucosa retal adjacente à linha pectínea, alteração correlacionada a prolapso redutível",
        "label": "prolapso",
        "extra": "Provável prolapso redutível de mucosa retal"
      },
      {
        "valor": "nota-se cicatriz por provável manipulação cirúrgica em mucosa retal adjacente à linha pectínea",
        "label": "cicatriz",
        "extra": ""
      }
    ],
    "local": [
      {
        "valor": "",
        "label": "-",
        "extra": ""
      },
      {
        "valor": "acima da linha pectínea",
        "label": "acima da linha pectínea",
        "extra": " internas"
      },
      {
        "valor": "abaixo da linha pectínea",
        "label": "abaixo da linha pectínea",
        "extra": " externas"
      },
      {
        "valor": "acima e abaixo da linha pectínea",
        "label": "mista",
        "extra": " mistas"
      }
    ]
  },
  "conclusao": [
    {
      "nome": "Normal",
      "id": "concnormal",
      "valor": "- Exame dentro dos padrões de normalidade."
    },
    {
      "nome": "Bx seriadas",
      "valor": "- Realizadas biópsias seriadas de íleo terminal, cólon direito, cólon esquerdo e reto."
    },
    {
      "nome": "RTS normal",
      "valor": "- Exame dentro dos padrões de normalidade."
    },
    {
      "nome": "Preparo regular",
      "valor": "- Preparo regular para o exame, reduzindo a taxa de detecção de lesões. Recomenda-se realização de nova colonoscopia em até um ano."
    },
    {
      "nome": "Colect esq reconst",
      "valor": "- Status pós-operatório de colectomia esquerda com reconstrução de trânsito."
    },
    {
      "nome": "Colect dir reconst",
      "valor": "- Status pós-operatório de colectomia direita com reconstrução de trânsito.<br>"
    },
    {
      "nome": "Retossigmoidect c/ reconst",
      "valor": "- Status pós-operatório de retossigmoidectomia com reconstrução de trânsito intestinal."
    },
    {
      "nome": "Hartmann + retite de desuso",
      "valor": "- Status pós-operatório de retossigmoidectomia à Hartmann.<br>- Retite de desuso."
    }
  ],
  "conclusaoSimples": {
    "numero": [
      {
        "valor": "",
        "label": "1"
      },
      {
        "valor": "02",
        "label": "2"
      },
      {
        "valor": "03",
        "label": "3"
      },
      {
        "valor": "04",
        "label": "4"
      },
      {
        "valor": "05",
        "label": "5"
      },
      {
        "valor": "",
        "label": "-"
      }
    ],
    "lesao": [
      {
        "valor": "Pólipo séssil",
        "label": "Is"
      },
      {
        "valor": "Pólipo subpediculado",
        "label": "Isp"
      },
      {
        "valor": "Pólipo pediculado",
        "label": "Ip"
      },
      {
        "valor": "Lesão planoelevada",
        "label": "IIa"
      },
      {
        "valor": "Lesão planodeprimida",
        "label": "IIc"
      },
      {
        "valor": "LST-GH",
        "label": "LST-GH"
      },
      {
        "valor": "LST granular nodular mista",
        "label": "LST nod mista"
      },
      {
        "valor": "LST-NG planoelevada",
        "label": "LST planoelevada"
      },
      {
        "valor": "LST-NG pseudodeprimida",
        "label": "LST pseudodeprimida"
      },
      {
        "valor": "Angiectasia",
        "label": "Angiectasia"
      },
      {
        "valor": "Lipoma",
        "label": "Lipoma"
      }
    ],
    "local": [
      {
        "valor": "ceco",
        "label": "ceco"
      },
      {
        "valor": "cólon ascendente",
        "label": "ascendente"
      },
      {
        "valor": "ângulo hepático",
        "label": "ang hepático"
      },
      {
        "valor": "cólon transverso",
        "label": "transverso"
      },
      {
        "valor": "ângulo esplênico",
        "label": "ang esplênico"
      },
      {
        "valor": "cólon descendente",
        "label": "descendente"
      },
      {
        "valor": "cólon sigmoide",
        "label": "sigmoide"
      },
      {
        "valor": "reto",
        "label": "reto"
      }
    ],
    "resseccao": [
      {
        "valor": "Polipectomia.",
        "label": "Polipectomia"
      },
      {
        "valor": "Ressecção com alça a frio (polipectomia).",
        "label": "IIa polipectomia"
      },
      {
        "valor": "Polipectomia com eletrocauterização.",
        "label": "Alça diatérmica"
      },
      {
        "valor": "Mucosectomia em monobloco.",
        "label": "EMR monobloco"
      },
      {
        "valor": "Mucosectomia fragmentada.",
        "label": "EMR fragmentada"
      },
      {
        "valor": "Ressecção em monobloco por ESD.",
        "label": "ESD"
      },
      {
        "valor": "Ressecção em monobloco por técnica híbrida (ESD+mucosectomia).",
        "label": "Híbrida"
      },
      {
        "valor": "",
        "label": "-"
      }
    ]
  },
  "conclusaoComposta": {
    "lesao": [
      {
        "valor": "Pólipos sésseis",
        "label": "Is"
      },
      {
        "valor": "Pólipos subpediculados",
        "label": "Isp"
      },
      {
        "valor": "Pólipos pediculados",
        "label": "Ip"
      },
      {
        "valor": "Lesões planoelevadas",
        "label": "IIa"
      },
      {
        "valor": "Lesões planodeprimidas",
        "label": "IIc"
      },
      {
        "valor": "LSTs-GH",
        "label": "LSTs-GH"
      },
      {
        "valor": "LSTs granulares nodulares mistas",
        "label": "LSTs nod mista"
      },
      {
        "valor": "LSTs-NG planoelevadas",
        "label": "LSTs planoelevadas"
      },
      {
        "valor": "LSTs-NG pseudodeprimidas",
        "label": "LSTs pseudodep"
      }
    ],
    "quantidades": {
      "ceco": {
        "id": "numeroceco-conc",
        "label": "Ceco",
        "prefixo": " {n} em ceco;"
      },
      "ascendente": {
        "id": "numeroasc-conc",
        "label": "Asc",
        "prefixo": " {n} em cólon ascendente;"
      },
      "anghep": {
        "id": "numeroanghep-conc",
        "label": "Ang hep",
        "prefixo": " {n} em ângulo hepático;"
      },
      "transverso": {
        "id": "numerotransv-conc",
        "label": "Transv",
        "prefixo": " {n} em cólon transverso;"
      },
      "angesp": {
        "id": "numeroangesp-conc",
        "label": "Ang esp",
        "prefixo": " {n} em ângulo esplênico;"
      },
      "descendente": {
        "id": "numerodesc-conc",
        "label": "Desc",
        "prefixo": " {n} em cólon descendente;"
      },
      "sigmoide": {
        "id": "numerosig-conc",
        "label": "Sig",
        "prefixo": " {n} em cólon sigmoide;"
      },
      "reto": {
        "id": "numeroreto-conc",
        "label": "Reto",
        "prefixo": " {n} em reto;"
      }
    },
    "resseccao": [
      {
        "valor": "Polipectomias",
        "label": "polipectomia"
      },
      {
        "valor": "Ressecções com alça a frio (polipectomia)",
        "label": "IIa polipectomia"
      },
      {
        "valor": "Polipectomias com eletrocauterização",
        "label": "alça diatérmica"
      },
      {
        "valor": "Mucosectomias em monobloco",
        "label": "EMR monobloco"
      },
      {
        "valor": "Mucosectomias fragmentada",
        "label": "EMR fragmentada"
      },
      {
        "valor": "Ressecções em monobloco por ESD",
        "label": "ESD"
      },
      {
        "valor": "Ressecções em monobloco por técnica híbrida (ESD + mucosectomia)",
        "label": "Híbrida"
      }
    ]
  },
  "obs": [
    {
      "nome": "Redundante",
      "valor": "nota-se certa redundância do cólon, que pode justificar quadro de constipação e eventual distensão abdominal."
    },
    {
      "nome": "Enc amb lesões",
      "valor": "realizado encaminhamento para ressecção endoscópica em Ambulatório de Grandes Lesões."
    },
    {
      "nome": "Projeto Alerta",
      "valor": "realizado encaminhamento para avaliação da equipe de Oncologia via Projeto Alerta."
    },
    {
      "nome": "Gabriela",
      "valor": "realizado por Dra. Gabriela e acompanhado por Dr. Eduardo Ogawa."
    },
    {
      "nome": "Valéria",
      "valor": "realizado por Dra. Valéria e acompanhado por Dr. Eduardo Ogawa."
    },
    {
      "nome": "Pinça",
      "valor": "Material utilizado: pinça de biópsia."
    },
    {
      "nome": "Alça",
      "valor": "Material utilizado: alça de polipectomia."
    }
  ],
  "outros": [
    {
      "nome": "Atestado M",
      "valor": "<span class='bold'>ATESTADO MÉDICO</span><br><br><br><br>Atesto que o paciente foi submetido a exame com sedação hoje e deve permanecer afastado de suas atividades laborais pelo restante do dia.<br><br><br><br><br>CID-10: Z019"
    },
    {
      "nome": "Atestado F",
      "id": "atestadomulher",
      "valor": "<span class='bold'>ATESTADO MÉDICO</span><br><br><br><br>Atesto que a paciente foi submetida a exame com sedação hoje e deve permanecer afastada de suas atividades laborais pelo restante do dia.<br><br><br><br><br>CID-10: Z019"
    },
    {
      "nome": "Fiber mais",
      "valor": "<span class='bold'>Receituário Médico</span><br><br><br><br>1. Fiber Mais<br><br>Misturar uma medida a um copo de água ou suco e tomar uma vez ao dia por 15 dias.<br><br><br>2- Buscopan composto gotas<br><br>Tomar 21 gotas de 6 em 6 horas, se tiver cólicas abdominais.<br><br><br>3- Proctyl pomada<br><br>Passar na região anal de 8 em 8 horas, se tiver desconforto anal."
    },
    {
      "nome": "Cipro",
      "valor": "<span class='bold'>Receituário Médico</span><br><br><br><br>1. Ciprofloxacino 500mg<br><br>Tomar um comprimido de 12 em 12 horas por 05 dias.<br><br><br>2- Pantoprazol 20mg<br><br>Tomar um comprimido 20 minutos antes do café da manhã e do jantar por 07 dias.<br><br><br>3- Buscopan composto gotas<br><br>Tomar 20 gotas de 6 em 6 horas, se tiver cólicas abdominais.<br><br><br>"
    },
    {
      "nome": "Pós-ressecção",
      "valor": "<span class='bold'>Orientação de Cuidados Pós-ressecção Colonoscópica</span><br><br><br><br>Após a retirada de pólipos ou lesões durante a colonoscopia, é importante seguir algumas orientações para garantir uma recuperação adequada e minimizar o risco de complicações, como recomendado a seguir:<br><br><br>- Dieta Branda: nos primeiros dias após o procedimento, opte por uma dieta leve e de fácil digestão, como alimentos cozidos, sopas, purês, iogurtes e frutas sem casca. Evite alimentos muito condimentados, frituras e alimentos ricos em fibras, que podem ser difíceis de digerir. Gradualmente reintroduza alimentos ricos em fibra à sua dieta conforme tolerância, sempre respeitando suas necessidades individuais e orientações médicas.<br><br>- Hidratação: beba bastante líquido, preferencialmente água, para ajudar na recuperação e prevenir a desidratação.<br><br>- Medicações: caso o médico responsável tenha julgado necessário, haverá receituário médico anexo. Atente-se também para estas recomendações, especialmente se houver prescrição de analgésicos ou outros medicamentos.<br><br>- Atividades Físicas: não realize atividades físicas moderadas a intensas, como levantar mais que 5kg, caminhadas mais longas que 5 minutos, subir escadas de maneira mais rápida, prática de academia ou de esportes durante sete dias a partir da data do procedimento. Após este período, você pode retomar atividades de forma gradual.<br><br>- Sinais de alerta: esteja atento a sintomas como dor abdominal moderada a intensa, febre, sangramento significativo à evacuação, ou qualquer outro sintoma preocupante. Caso ocorram, entre em contato imediatamente com seu médico ou procure o Pronto Atendimento.<br><br>- Acompanhamento Médico: é importante comparecer às consultas de seguimento conforme recomendado pelo seu médico para avaliação dos resultados do exame e eventuais biópsias."
    },
    {
      "nome": "AP lesões",
      "valor": "Aos cuidados de Dr. Denilson Mayrink ou Dra. Juliana Micelli."
    },
    {
      "nome": "Lesões colono",
      "valor": "ORIENTAÇÕES PÓS-TERAPÊUTICA CONOLOSCÓPICA EM <br>AMBULATÓRIO DE LESÕES:<br><br>* Aguardar contato da Sra. Marina (AMB de lesões) e equipe médica <br>da endoscopia para teleconsulta com informações sobre resultados <br>da biópsias, necessidade de complementação terapêutica e <br>programação de controle colonoscópico. NÃO É NECESSÁRIO <br>AGENDAMENTO DE CONSULTA COM ESPECIALISTA ANTES DO <br>NOSSO CONTATO.<br><br>Para dúvidas, telefone corporativo Ambulatório de Lesões (Marina ou Juliana): <br>(11) 95324-4041<br><br>DURANTE 7 DIAS:<br>1. Não realizar atividade física;<br>2. Evitar exposição ao sol por períodos prolongados;<br>3. Dieta laxativa e leve;<br>4. Em caso de sangramento volumoso nas fezes com coágulos ou dor <br>abdominal intensa, procurar atendimento de urgência via Pronto <br>Socorro da Prevent Senior (Hospital Madrid) e/ou entrar em contato com Dr. Eduardo Ogawa (11 97632-1588)."
    },
    {
      "nome": "Atestado lesões",
      "valor": "<span class='bold'>ATESTADO MÉDICO</span><br><br><br><br>Atesto que a paciente foi submetida a procedimento médico hoje e deve permanecer afastada de esforços físicos moderados a intensos durante 07 dias a partir de hoje.<br><br><br><br><br>CID-10: K635"
    }
  ]
};
