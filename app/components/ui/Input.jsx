export const Input = ({ className = "", type = "text", error = false, ...props }) => {
  const baseStyles =
    "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"

  const errorStyles = error
    ? "border-red-500 focus-visible:ring-red-500"
    : "border-input bg-background focus-visible:ring-ring"

  return <input type={type} className={`${baseStyles} ${errorStyles} ${className}`} {...props} />
}
