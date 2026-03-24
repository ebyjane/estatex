import * as pg from 'pg';

pg.defaults.ssl = {
  rejectUnauthorized: false,
};
