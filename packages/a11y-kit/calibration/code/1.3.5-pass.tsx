/** The same form with an autocomplete token on every personal field. */
export function Contact() {
  return (
    <form>
      <label htmlFor="name">Name</label>
      <input id="fullName" name="fullName" autoComplete="name" />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" />
      <label htmlFor="phone">Phone</label>
      <Input id="phone" type="tel" autoComplete="tel" onChange={(e) => e.target.value} />
      <label htmlFor="q">Search</label>
      <input id="q" type="search" autoComplete="off" />
    </form>
  );
}
