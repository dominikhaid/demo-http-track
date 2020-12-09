const gql = require('graphql-tag');
const ApolloClient = require('apollo-client').ApolloClient;
const fetch = require('node-fetch');
const createHttpLink = require('apollo-link-http').createHttpLink;
const setContext = require('apollo-link-context').setContext;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
const libxmljs = require('libxmljs');

export default async (req, res) => {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL,
    fetch: fetch,
  });

  const authLink = setContext((_, {headers}) => {
    return {
      headers: {
        ...headers,
        authorization: `Basic ZG9taW5pa2hhaWQ6cWpKUm9dRU1GRg==`,
      },
    };
  });

  const client = new ApolloClient({
    ssrMode: false,
    link: authLink.concat(httpLink),
    fetchOptions: {
      authorization: `Basic ZG9taW5pa2hhaWQ6cWpKUm9dRU1GRg==`,
      credentials: 'include',
    },
    headers: {
      authorization: `Basic ZG9taW5pa2hhaWQ6cWpKUm9dRU1GRg==`,
      credentials: 'include',
    },
    request: async operation => {
      operation.setContext({
        headers: {
          authorization: `Basic ZG9taW5pa2hhaWQ6cWpKUm9dRU1GRg==`,
          credentials: 'include',
        },
      });
    },
    cache: new InMemoryCache(),
  });

  const GET_SITEMAP = gql`
    {
      posts(where: {status: PUBLISH, orderby: {field: DATE, order: DESC}}) {
        nodes {
          dateGmt
          slug
        }
      }
      pages(where: {status: PUBLISH}) {
        nodes {
          dateGmt
          slug
        }
      }
    }
  `;

  try {
    const result = await client.query({
      query: GET_SITEMAP,
    });
    let xmlString =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    result.data.posts.nodes.map(el => {
      xmlString += `<url>\n<loc>${process.env.HOST}/blog/${el.slug}</loc>\n<lastmod>${el.dateGmt}</lastmod>\n</url>\n`;
      return true;
    });
    result.data.pages.nodes.map(el => {
      xmlString += `<url>\n<loc>${process.env.HOST}/blog/${el.slug}</loc>\n<lastmod>${el.dateGmt}</lastmod>\n</url>\n`;
      return true;
    });
    xmlString += '</urlset>';
    let xmlDoc = libxmljs.parseXml(xmlString);
    res.setHeader('Content-Type', 'text/xml');
    res.send(xmlDoc.toString());
    res.end();
  } catch (err) {
    res.send(JSON.stringify(err));
  }
};

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};
