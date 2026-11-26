/** A contact form whose fields say nothing about their purpose. */
export function Contact() {
  return (
    <form>
      <label htmlFor="name">Name</label>
      <input id="fullName" name="fullName" />
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      <label htmlFor="phone">Phone</label>
      <Input id="phone" type="tel" onChange={(e) => e.target.value} />
    </form>
  );
}
