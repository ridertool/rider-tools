import {handler} from '../netlify/functions/stations.mjs';
const allowed=new Set(['https://riderstool.com','https://www.riderstool.com']);
export default async function stations(req,res){
  const origin=req.headers.origin;
  if(origin&&!allowed.has(origin)){res.status(403).json({code:'ORIGIN_NOT_ALLOWED'});return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.status(204).end();return;}
  const answer=await handler({httpMethod:req.method,queryStringParameters:req.query});
  for(const [key,value] of Object.entries(answer.headers))res.setHeader(key,value);
  res.status(answer.statusCode).send(answer.body);
}
