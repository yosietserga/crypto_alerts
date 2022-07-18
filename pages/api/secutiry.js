export default function handler(req, res) {
  console.log(req.body);
  try {
    res.status(200).json({
      result: "OK",
      payload: {
        rate: 16,
        currencySymbol: 'USD',
        times: 12,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
