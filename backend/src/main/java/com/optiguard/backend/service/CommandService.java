package com.optiguard.backend.service;

import com.optiguard.backend.entity.Command;
import com.optiguard.backend.repository.CommandRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommandService {

    private final CommandRepository commandRepository;

    public CommandService(CommandRepository commandRepository) {
        this.commandRepository = commandRepository;
    }

    public Command createCommand(Command command) {
        return commandRepository.save(command);
    }

    public List<Command> getAllCommands() {
        return commandRepository.findAll();
    }

    public Optional<Command> getCommandById(Long id) {
        return commandRepository.findById(id);
    }

    public Command updateCommand(Long id, Command updatedCommand) {
        Command existingCommand = commandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Command not found"));

        existingCommand.setCommandType(updatedCommand.getCommandType());
        existingCommand.setPayload(updatedCommand.getPayload());
        existingCommand.setStatus(updatedCommand.getStatus());
        existingCommand.setUser(updatedCommand.getUser());

        return commandRepository.save(existingCommand);
    }

    public void deleteCommand(Long id) {
        commandRepository.deleteById(id);
    }
}