INSERT INTO STUDENTE (Matricola, Nome, Cognome, DataNascita) VALUES
  (1001, 'Luca', 'Bianchi', '2001-03-14'),
  (1002, 'Sara', 'Rossi', '2000-07-22'),
  (1003, 'Marco', 'Verdi', '2002-11-05');

INSERT INTO DOCENTE (IdDocente, Nome, Cognome, Dipartimento) VALUES
  (501, 'Anna', 'Marini', 'Informatica'),
  (502, 'Paolo', 'Conti', 'Matematica'),
  (503, 'Giulia', 'Serra', 'Fisica');

INSERT INTO MATERIA (IdMateria, Nome, CFU) VALUES
  (201, 'Basi di Dati', 9),
  (202, 'Analisi Matematica', 12),
  (203, 'Fisica 1', 6);

INSERT INTO ESAME (Matricola, IdMateria, DataEsame, Voto, Lode, IdDocente) VALUES
  (1001, 201, '2024-02-10', 28, 0, 501),
  (1001, 202, '2024-06-18', 27, 0, 502),
  (1002, 201, '2024-02-10', 30, 1, 501),
  (1002, 203, '2024-07-05', 26, 0, 503),
  (1003, 202, '2024-06-18', 25, 0, 502),
  (1003, 203, '2024-07-05', 29, 0, 503);
