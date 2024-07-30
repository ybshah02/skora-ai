import json

class HTMLTemplateFormatter:
    def __init__(self, template_path):
        self.template_path = template_path
        self.template_content = self._read_template()

    def _read_template(self):
        """Reads the HTML template from the specified path."""
        with open(self.template_path, 'r', encoding='utf-8') as file:
            return file.read()

    @staticmethod
    def _format_value(value):
        """
        Formats the value based on its type.
        Converts lists and dicts to JSON strings, and leaves other types as is.
        """
        if isinstance(value, (list, dict)):
            return json.dumps(value)
        return value 

    def fill_template(self, **kwargs):
        """Fills the template with the provided keyword arguments."""
        formatted_content = self.template_content
        for key, value in kwargs.items():
            formatted_value = self._format_value(value)
            formatted_content = formatted_content.replace(f"{{{{{key}}}}}", str(formatted_value))
        return formatted_content
