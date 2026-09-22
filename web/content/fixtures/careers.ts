export const careersPage = {
  title: "Careers",
  note: "We're interested in hearing from you.",
  lede: "Share a few details and we will be in touch.",
  fields: {
    name: {
      label: "Name",
      placeholder: "Your name",
    },
    email: {
      label: "Email",
      placeholder: "you@email.com",
    },
    phone: {
      label: "Phone",
      placeholder: "Your phone number",
    },
    resume: {
      label: "Resume",
      empty: "Upload a document",
      help: "PDF or Word. Four megabytes or less.",
    },
  },
  submit: "Submit",
  submitting: "Sending",
  success: "Thanks. We received your application.",
} as const;
