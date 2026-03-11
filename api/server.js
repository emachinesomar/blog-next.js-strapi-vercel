module.exports = async (req, res) => {
  return res.status(200).send("BRIDGE_ACTIVE: " + req.url);
};
