const validate = (schema, source = "body") => (req, res, next) => {
  const data = source === "query" ? req.query : req.body;
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "_general";
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    }
    return res.status(422).json({ errors });
  }

  if (source === "query") {
    req.query = result.data;
  } else {
    req.body = result.data;
  }

  next();
};

module.exports = validate;
